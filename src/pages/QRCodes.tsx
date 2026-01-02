import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, ArrowLeft, QrCode, CloudUpload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Registration, Driver, Bus as BusType, Route as TransportRoute } from '@/types/transport';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

export default function QRCodes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>(location.state?.registrations || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [saveStats, setSaveStats] = useState({ inserted: 0, duplicates: 0, errors: 0 });

  const generateQRData = (reg: Registration) => {
    return reg.qrCodeData || JSON.stringify({
      id: reg.id,
      driver: reg.driverName,
      bus: reg.busNumber,
      plate: reg.busPlate,
      route: reg.routeName,
      location: reg.location,
      createdAt: new Date(reg.createdAt).toISOString(),
    });
  };

  const handleDownloadAll = () => {
    registrations.forEach((reg, index) => {
      setTimeout(() => {
        const svg = document.getElementById(`qr-${reg.id}`)?.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = 300;
          canvas.height = 300;
          if (ctx) {
            ctx.fillStyle = '#1E2329';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 25, 25, 250, 250);
          }
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `qrcode-${reg.busPlate}.png`;
          link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }, index * 200);
    });

    toast({
      title: 'Download iniciado',
      description: `Baixando ${registrations.length} QR Codes.`,
    });
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCodesHtml = registrations.map((reg) => {
      const svg = document.getElementById(`qr-${reg.id}`)?.querySelector('svg');
      if (!svg) return '';
      const svgData = new XMLSerializer().serializeToString(svg);
      return `
        <div class="qr-item">
          ${svgData}
          <div class="info">
            <h3>${reg.busPlate}</h3>
            <p><strong>Motorista:</strong> ${reg.driverName}</p>
            <p><strong>Ônibus:</strong> ${reg.busNumber}</p>
            <p><strong>Rota:</strong> ${reg.routeName}</p>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - Transporte</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
            }
            .qr-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .qr-item svg {
              width: 150px;
              height: 150px;
            }
            .info {
              text-align: center;
              margin-top: 10px;
            }
            .info h3 {
              margin: 0 0 5px;
              font-size: 14px;
            }
            .info p {
              margin: 3px 0;
              font-size: 11px;
              color: #666;
            }
            @media print {
              .container {
                grid-template-columns: repeat(3, 1fr);
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${qrCodesHtml}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleSaveToSupabase = async () => {
    if (registrations.length === 0) return;
    setIsSaving(true);

    try {
      // 1. Get all existing drivers, buses and routes for resolution
      const [driversRes, busesRes, routesRes] = await Promise.all([
        supabase.from('drivers').select('*'),
        supabase.from('buses').select('*'),
        supabase.from('routes').select('*'),
      ]);

      if (driversRes.error) {
        console.error('Erro ao buscar motoristas:', driversRes.error);
        toast({ title: 'Erro de Conexão', description: `Não foi possível acessar a tabela 'drivers': ${driversRes.error.message}`, variant: 'destructive' });
        setIsSaving(false);
        return;
      }
      if (busesRes.error) {
        console.error('Erro ao buscar ônibus:', busesRes.error);
        toast({ title: 'Erro de Conexão', description: `Não foi possível acessar a tabela 'buses': ${busesRes.error.message}`, variant: 'destructive' });
        setIsSaving(false);
        return;
      }

      const driverMap = new Map(driversRes.data?.map(d => [d.name.toUpperCase(), d.id]) || []);
      const busMap = new Map(busesRes.data?.map(b => [(b.plate || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), b.id]) || []);
      const routeMap = new Map(routesRes.data?.map(r => [r.name.toUpperCase(), r.id]) || []);

      const updatedRegistrations = [...registrations];
      const errors: string[] = [];
      const stats = { inserted: 0, duplicates: 0 };

      for (let i = 0; i < updatedRegistrations.length; i++) {
        const reg = updatedRegistrations[i];

        // Resolve Driver
        let driverId = driverMap.get(reg.driverName.toUpperCase());
        if (!driverId) {
          const { data, error } = await supabase.from('drivers').insert([{ name: reg.driverName }]).select().single();
          if (error) {
            console.error('Erro ao cadastrar motorista:', error);
            errors.push(`Motorista: ${reg.driverName} - ${error.message}`);
            toast({
              title: 'Erro ao cadastrar motorista',
              description: `Não foi possível cadastrar ${reg.driverName}: ${error.message}`,
              variant: 'destructive',
            });
            continue;
          }
          driverId = data.id;
          driverMap.set(reg.driverName.toUpperCase(), driverId);
        }

        // Resolve Bus
        const normalizedPlate = reg.busPlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let busId = busMap.get(normalizedPlate);
        if (!busId) {
          const { data, error } = await supabase.from('buses').insert([{ plate: reg.busPlate, bus_number: reg.busNumber }]).select().single();
          if (error) {
            console.error('Erro ao cadastrar ônibus:', error);
            errors.push(`Ônibus: ${reg.busPlate} - ${error.message}`);
            continue;
          }
          busId = data.id;
          busMap.set(normalizedPlate, busId);
        }

        // Resolve Route
        let routeId = routeMap.get(reg.routeName.toUpperCase());
        if (!routeId) {
          const { data, error } = await supabase.from('routes').insert([{ name: reg.routeName }]).select().single();
          if (error) {
            console.error('Erro ao cadastrar rota:', error);
            errors.push(`Rota: ${reg.routeName} - ${error.message}`);
            continue;
          }
          routeId = data.id;
          routeMap.set(reg.routeName.toUpperCase(), routeId);
        }

        // 2. Duplicate Check: Same driver + same bus in active registrations
        const { data: existingReg, error: checkError } = await supabase
          .from('registrations')
          .select('id')
          .eq('driver_id', driverId)
          .eq('bus_id', busId)
          .eq('status', 'active')
          .maybeSingle();

        if (checkError) {
          console.error('Erro na checagem de duplicados:', checkError);
        }

        if (existingReg) {
          stats.duplicates++;
          toast({
            title: 'Cadastro já existe',
            description: `Motorista ${reg.driverName} e ônibus ${reg.busPlate} já cadastrados.`,
            variant: 'default',
          });
          continue;
        }

        // 3. Save Registration
        const { data: newReg, error: regError } = await supabase.from('registrations').insert([{
          driver_id: driverId,
          bus_id: busId,
          route_id: routeId,
          location: reg.location,
          status: 'active'
        }]).select().single();

        if (regError) {
          console.error('Erro ao cadastrar escala:', regError);
          const errorMsg = `${regError.message} ${regError.details || ''} ${regError.hint || ''}`;
          errors.push(`Escala: ${reg.busPlate} - ${errorMsg}`);
          toast({
            title: 'Erro ao cadastrar escala',
            description: `Ônibus ${reg.busPlate}: ${errorMsg}`,
            variant: 'destructive',
          });
          continue;
        }

        if (!newReg) continue;

        // 4. Update QR Code Data with real DB id
        const finalQRData = JSON.stringify({
          id: newReg.id,
          driver: reg.driverName,
          driverBrief: reg.driverName.split(' ')[0].toUpperCase(),
          bus: reg.busNumber,
          plate: normalizedPlate,
          route: reg.routeName,
          location: reg.location,
          createdAt: newReg.created_at,
        });

        // Update in DB (for qr_code_data column)
        await supabase.from('registrations').update({ qr_code_data: finalQRData }).eq('id', newReg.id);

        updatedRegistrations[i] = {
          ...reg,
          id: newReg.id,
          qrCodeData: finalQRData,
        };
        stats.inserted++;
      }

      setRegistrations(updatedRegistrations);
      setSaveStats({
        inserted: stats.inserted,
        duplicates: stats.duplicates,
        errors: errors.length
      });
      setShowResultModal(true);

      if (errors.length > 0) {
        console.error('Falhas no salvamento:', errors);
      }

    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      toast({
        title: 'Erro no salvamento',
        description: 'Ocorreu um erro ao tentar enviar os dados ao banco.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (registrations.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/cadastro')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4 mx-auto">
            <QrCode className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum QR Code para exibir</h2>
          <p className="text-muted-foreground">
            Importe uma planilha Excel na tela de cadastro para gerar os QR Codes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/cadastro')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">QR Codes Gerados</h1>
            <p className="text-muted-foreground mt-1">
              {registrations.length} QR Codes gerados via importação Excel
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleDownloadAll} disabled={isSaving}>
            <Download className="w-4 h-4 mr-2" />
            Baixar Todos
          </Button>
          <Button variant="outline" onClick={handlePrintAll} disabled={isSaving}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Todos
          </Button>
          <Button onClick={handleSaveToSupabase} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CloudUpload className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Enviando...' : 'Enviar ao Banco de dados'}
          </Button>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {registrations.map((reg) => (
          <div
            key={reg.id}
            className="bg-card rounded-xl border border-border p-6 flex flex-col items-center"
          >
            <div
              id={`qr-${reg.id}`}
              className="p-4 bg-accent rounded-xl border-2 border-primary/20 mb-4"
            >
              <QRCodeSVG
                value={generateQRData(reg)}
                size={150}
                level="H"
                bgColor="#1E2329"
                fgColor="#FCD535"
              />
            </div>
            <div className="text-center space-y-1 w-full">
              <p className="font-mono text-primary text-sm">{reg.busPlate}</p>
              <p className="font-medium text-foreground text-sm truncate">{reg.driverName}</p>
              <p className="text-muted-foreground text-xs">{reg.busNumber}</p>
              <p className="text-muted-foreground text-xs truncate">{reg.routeName}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="sm:max-w-md bg-card border-primary/20">
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full ${saveStats.inserted > 0 ? 'bg-primary/20 text-primary' : 'bg-accent text-muted-foreground'}`}>
              {saveStats.inserted > 0 ? <CheckCircle2 className="w-10 h-10" /> : <Info className="w-10 h-10" />}
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              {saveStats.inserted > 0 ? 'Sincronização Concluída' : 'Processamento Finalizado'}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Os dados foram processados e validados contra o banco de dados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent/50 p-4 rounded-xl border border-border flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{saveStats.inserted}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Novos</span>
              </div>
              <div className="bg-accent/50 p-4 rounded-xl border border-border flex flex-col items-center">
                <span className="text-2xl font-bold text-foreground">{saveStats.duplicates}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Duplicados</span>
              </div>
            </div>

            {saveStats.errors > 0 && (
              <div className="bg-destructive/10 p-3 rounded-lg flex items-center gap-3 text-destructive border border-destructive/20">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Houveram {saveStats.errors} erros durante o processo. Veja o console para detalhes.</p>
              </div>
            )}

            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
              <p className="text-xs text-center text-muted-foreground">
                Motoristas e ônibus foram automaticamente vinculados ou criados conforme necessário.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full sm:w-32 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              onClick={() => setShowResultModal(false)}
            >
              ENTENDIDO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
