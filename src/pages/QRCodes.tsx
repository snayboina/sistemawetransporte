import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, ArrowLeft, QrCode, CloudUpload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Registration, Driver, Bus as BusType, Route as TransportRoute } from '@/types/transport';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function QRCodes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>(location.state?.registrations || []);
  const [isSaving, setIsSaving] = useState(false);

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
      const [{ data: drivers }, { data: buses }, { data: routes }] = await Promise.all([
        supabase.from('drivers').select('*'),
        supabase.from('buses').select('*'),
        supabase.from('routes').select('*'),
      ]);

      const driverMap = new Map(drivers?.map(d => [d.name.toUpperCase(), d.id]));
      const busMap = new Map(buses?.map(b => [(b.plate || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), b.id]));
      const routeMap = new Map(routes?.map(r => [r.name.toUpperCase(), r.id]));

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
        const { data: existingReg } = await supabase
          .from('registrations')
          .select('*, drivers(name), buses(plate)')
          .eq('driver_id', driverId)
          .eq('bus_id', busId)
          .eq('status', 'active')
          .maybeSingle();

        if (existingReg) {
          stats.duplicates++;
          toast({
            title: 'Cadastro já existe',
            description: `Motorista ${reg.driverName} e ônibus ${reg.busPlate} já cadastrados.`,
            variant: 'destructive',
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
          errors.push(`Escala: ${reg.busPlate} - ${regError.message}`);
          continue;
        }

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

      if (stats.inserted > 0) {
        toast({
          title: 'Sucesso!',
          description: `${stats.inserted} registros enviados ao banco de dados.`,
        });
      }

      if (errors.length > 0) {
        toast({
          title: 'Alguns erros ocorreram',
          description: `Falha em ${errors.length} itens. Verifique o console ou revise as permissões (RLS) no Supabase.`,
          variant: 'destructive',
        });
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
    </div>
  );
}
