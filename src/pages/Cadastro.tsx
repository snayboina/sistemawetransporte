import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Copy, Check, MapPin, User, Bus, Route, QrCode, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { Registration, Driver, Bus as BusType, Route as TransportRoute } from '@/types/transport';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FormData {
  driverId: string;
  busId: string;
  routeId: string;
  location: string;
}

export default function Cadastro() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    driverId: '',
    busId: '',
    routeId: '',
    location: '',
  });
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [viewingSpecificReg, setViewingSpecificReg] = useState<Registration | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [d, b, r, reg] = await Promise.all([
        supabase.from('drivers').select('*'),
        supabase.from('buses').select('*'),
        supabase.from('routes').select('*'),
        supabase.from('registrations').select(`
          *,
          drivers:driver_id(name),
          buses:bus_id(bus_number, plate),
          routes:route_id(name)
        `).order('created_at', { ascending: false }).limit(5)
      ]);

      if (d.error) console.error('Erro drivers:', d.error);
      if (b.error) console.error('Erro buses:', b.error);
      if (r.error) console.error('Erro routes:', r.error);
      if (reg.error) {
        console.error('Erro registrations:', reg.error);
        toast({
          title: 'Erro ao carregar dados',
          description: reg.error.message,
          variant: 'destructive',
        });
      }

      if (d.data) setDrivers(d.data);
      if (b.data) setBuses(b.data);
      if (r.data) setRoutes(r.data);

      if (reg.data) {
        console.log('Registros brutos carregados:', reg.data);
        const mapped = reg.data.map((item: any) => ({
          id: item.id,
          driverId: item.driver_id,
          driverName: item.drivers?.name || item.driver_id || 'N/A',
          busNumber: item.buses?.bus_number || item.bus_id || 'N/A',
          busPlate: item.buses?.plate || 'N/A',
          routeId: item.route_id,
          routeName: item.routes?.name || item.route_id || 'N/A',
          location: item.location,
          createdAt: new Date(item.created_at || new Date()),
          qrCodeData: item.qr_code_data
        }));
        console.log('Registros mapeados:', mapped);
        setRegistrations(mapped);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const selectedDriver = drivers.find((d) => d.id === formData.driverId);
  const selectedBus = buses.find((b) => b.id === formData.busId);
  const selectedRoute = routes.find((r) => r.id === formData.routeId);

  const handleSelectRegistration = (reg: Registration) => {
    setViewingSpecificReg(reg);
    setGeneratedQR(reg.qrCodeData);
    // Scroll to QR section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadExample = () => {
    const exampleData = [
      { Motorista: 'Carlos Silva', Onibus: 'AMB-3241', Placa: 'ABC-1234', Rota: 'Terminal Centro → Shopping', Localizacao: 'Terminal Central' },
      { Motorista: 'Maria Santos', Onibus: 'AMB-3242', Placa: 'DEF-5678', Rota: 'Bairro Norte → Centro', Localizacao: 'Ponto Inicial Norte' },
      { Motorista: 'João Oliveira', Onibus: 'AMB-3243', Placa: 'GHI-9012', Rota: 'Centro → Aeroporto', Localizacao: 'Praça Central' },
    ];

    const ws = XLSX.utils.json_to_sheet(exampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cadastros');

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Motorista
      { wch: 15 }, // Onibus
      { wch: 12 }, // Placa
      { wch: 30 }, // Rota
      { wch: 25 }, // Localizacao
    ];

    XLSX.writeFile(wb, 'modelo_cadastro_transporte.xlsx');

    toast({
      title: 'Planilha de exemplo baixada',
      description: 'Use este modelo para preencher os dados.',
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<{
        Motorista: string;
        Onibus: string;
        Placa: string;
        Rota: string;
        Localizacao: string;
      }>(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: 'Planilha vazia',
          description: 'A planilha não contém dados para importar.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Validate columns
      const requiredColumns = ['Motorista', 'Onibus', 'Placa', 'Rota', 'Localizacao'];
      const firstRow = jsonData[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));

      if (missingColumns.length > 0) {
        toast({
          title: 'Colunas faltando',
          description: `As seguintes colunas são obrigatórias: ${missingColumns.join(', ')}`,
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Create registrations
      const newRegistrations: Registration[] = jsonData.map((row) => {
        const id = crypto.randomUUID();

        // Normalize data
        const normalizedPlate = row.Placa?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '';
        const driverFirstName = row.Motorista?.split(' ')[0].toUpperCase() || '';
        const normalizedDriverName = row.Motorista?.toUpperCase() || '';
        const normalizedRouteName = row.Rota?.toUpperCase() || '';

        // Usamos apenas o ID para o QR Code para máxima precisão na leitura
        const qrData = id;

        return {
          id,
          driverId: crypto.randomUUID(), // Temporário, será resolvido no salvamento
          driverName: normalizedDriverName,
          busNumber: row.Onibus,
          busPlate: normalizedPlate,
          routeId: crypto.randomUUID(), // Temporário, será resolvido no salvamento
          routeName: normalizedRouteName,
          location: row.Localizacao,
          createdAt: new Date(),
          qrCodeData: qrData,
        };
      });

      toast({
        title: 'Importação concluída!',
        description: `${newRegistrations.length} cadastros preparados. Agora você precisa salvá-los no banco na próxima tela.`,
        duration: 3000,
      });

      // Navigate to QR Codes page with the registrations
      setTimeout(() => {
        navigate('/qrcodes', { state: { registrations: newRegistrations } });
      }, 500);
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível ler a planilha. Verifique o formato.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.driverId || !formData.busId || !formData.routeId || !formData.location) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para continuar.',
        variant: 'destructive',
      });
      return;
    }

    // Normalize data for individual registration
    const normalizedPlate = selectedBus?.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '';
    const driverFirstName = selectedDriver?.name.split(' ')[0].toUpperCase() || '';
    const normalizedDriverName = selectedDriver?.name.toUpperCase() || '';
    const normalizedRouteName = selectedRoute?.name.toUpperCase() || '';

    // Usamos apenas o ID para o QR Code para máxima precisão na leitura
    const newId = crypto.randomUUID();
    const qrData = newId;

    setViewingSpecificReg(null);
    saveToSupabase(qrData, newId);
  };

  const saveToSupabase = async (qrData: string, customId?: string) => {
    try {
      const { data, error } = await supabase.from('registrations').insert([
        {
          id: customId,
          driver_id: formData.driverId,
          bus_id: formData.busId,
          route_id: formData.routeId,
          location: formData.location,
          qr_code_data: qrData
        }
      ]).select();

      if (error) throw error;

      setGeneratedQR(qrData);
      fetchInitialData(); // Refresh list

      toast({
        title: 'QR Code gerado com sucesso!',
        description: 'O código está pronto para uso e foi salvo no banco.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível persistir o cadastro no Supabase.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
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

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const plate = viewingSpecificReg ? viewingSpecificReg.busPlate : selectedBus?.plate;
        link.download = `qrcode-${plate || 'transport'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 'image/png');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

    toast({
      title: 'Download iniciado',
      description: 'O QR Code está sendo baixado.',
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    const plate = viewingSpecificReg ? viewingSpecificReg.busPlate : selectedBus?.plate;
    const driverName = viewingSpecificReg ? viewingSpecificReg.driverName : selectedDriver?.name;
    const busNumber = viewingSpecificReg ? viewingSpecificReg.busNumber : selectedBus?.bus_number;
    const routeName = viewingSpecificReg ? viewingSpecificReg.routeName : selectedRoute?.name;
    const locationValue = viewingSpecificReg ? viewingSpecificReg.location : formData.location;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${plate}</title>
          <style>
            @page {
              size: A4 ${printOrientation};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
              background-color: #fff;
            }
            .print-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 30px;
              border: 2px solid #eee;
              border-radius: 20px;
              width: ${printOrientation === 'portrait' ? '320px' : '450px'};
              text-align: center;
            }
            svg {
              width: 220px !important;
              height: 220px !important;
              margin-bottom: 20px;
            }
            .info h1 {
              margin: 0 0 10px;
              font-size: 28px;
              font-weight: 900;
              color: #000;
              letter-spacing: -1px;
            }
            .info p {
              margin: 4px 0;
              font-size: 13px;
              color: #444;
              line-height: 1.4;
            }
            .info strong {
              color: #000;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 0.5px;
              margin-right: 4px;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .print-card { border-color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="print-card">
            ${svgData}
            <div class="info">
              <h1>${plate}</h1>
              <p><strong>Motorista:</strong> ${driverName}</p>
              <p><strong>Ônibus:</strong> ${busNumber || 'N/A'}</p>
              <p><strong>Rota:</strong> ${routeName}</p>
              <p><strong>Localização:</strong> ${locationValue}</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleCopy = async () => {
    if (!generatedQR) return;

    await navigator.clipboard.writeText(generatedQR);
    setCopied(true);

    toast({
      title: 'Copiado!',
      description: 'Dados do QR Code copiados para a área de transferência.',
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFormData({ driverId: '', busId: '', routeId: '', location: '' });
    setGeneratedQR(null);
    setViewingSpecificReg(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === registrations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(registrations.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkGenerateQR = () => {
    const selectedRegs = registrations.filter(r => selectedIds.includes(r.id));
    if (selectedRegs.length === 0) return;

    navigate('/qrcodes', { state: { registrations: selectedRegs, isAlreadySaved: true } });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Novo Cadastro</h1>
        <p className="text-muted-foreground mt-1">
          Cadastre uma nova operação e gere o QR Code automaticamente
        </p>
      </div>

      {/* Excel Import Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">Importar via Excel</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Cadastre múltiplos motoristas de uma vez importando uma planilha Excel
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={handleDownloadExample}>
            <Download className="w-4 h-4 mr-2" />
            Baixar Planilha de Exemplo
          </Button>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            <Button disabled={isProcessing}>
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Carregar Planilha'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Cadastro Individual</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Driver */}
            <div className="space-y-2">
              <Label htmlFor="driver" className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Motorista
              </Label>
              <Select
                value={formData.driverId}
                onValueChange={(value) => setFormData({ ...formData, driverId: value })}
              >
                <SelectTrigger id="driver" className="bg-accent border-border">
                  <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bus */}
            <div className="space-y-2">
              <Label htmlFor="bus" className="flex items-center gap-2 text-muted-foreground">
                <Bus className="w-4 h-4" />
                Ônibus / Placa
              </Label>
              <Select
                value={formData.busId}
                onValueChange={(value) => setFormData({ ...formData, busId: value })}
              >
                <SelectTrigger id="bus" className="bg-accent border-border">
                  <SelectValue placeholder="Selecione o ônibus" />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.bus_number} - {bus.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Route */}
            <div className="space-y-2">
              <Label htmlFor="route" className="flex items-center gap-2 text-muted-foreground">
                <Route className="w-4 h-4" />
                Rota
              </Label>
              <Select
                value={formData.routeId}
                onValueChange={(value) => setFormData({ ...formData, routeId: value })}
              >
                <SelectTrigger id="route" className="bg-accent border-border">
                  <SelectValue placeholder="Selecione a rota" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.code} - {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Localização Inicial
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="Ex: Terminal Central ou -23.5505, -46.6333"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-accent border-border"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                <QrCode className="w-4 h-4 mr-2" />
                Gerar QR Code
              </Button>
              {generatedQR && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* QR Code Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">QR Code Gerado</h2>
          </div>

          {generatedQR ? (
            <div className="space-y-6 animate-scale-in">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div
                  ref={qrRef}
                  className="p-6 bg-accent rounded-xl border-2 border-primary/20"
                >
                  <QRCodeSVG
                    value={generatedQR}
                    size={200}
                    level="M"
                    includeMargin={true}
                    bgColor="#1E2329"
                    fgColor="#FCD535"
                  />
                </div>
              </div>

              {/* Info Summary */}
              <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Motorista</span>
                  <span className="font-medium text-foreground">
                    {viewingSpecificReg ? viewingSpecificReg.driverName : selectedDriver?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ônibus</span>
                  <span className="font-medium text-foreground">
                    {viewingSpecificReg ? viewingSpecificReg.busNumber : selectedBus?.bus_number}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Placa</span>
                  <span className="font-medium text-primary">
                    {viewingSpecificReg ? viewingSpecificReg.busPlate : selectedBus?.plate}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rota</span>
                  <span className="font-medium text-foreground">
                    {viewingSpecificReg ? viewingSpecificReg.routeName : selectedRoute?.code}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Localização</span>
                  <span className="font-medium text-foreground truncate max-w-[150px]">
                    {viewingSpecificReg ? viewingSpecificReg.location : formData.location}
                  </span>
                </div>
              </div>

              {/* Print Orientation Selector */}
              <div className="flex flex-col gap-2 p-3 bg-accent/30 rounded-lg border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orientação da Impressão</span>
                <div className="flex gap-2">
                  <Button
                    variant={printOrientation === 'portrait' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "flex-1 text-[11px] h-8",
                      printOrientation === 'portrait' ? "bg-primary text-black hover:bg-primary/90" : ""
                    )}
                    onClick={() => setPrintOrientation('portrait')}
                  >
                    Vertical (Retrato)
                  </Button>
                  <Button
                    variant={printOrientation === 'landscape' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "flex-1 text-[11px] h-8",
                      printOrientation === 'landscape' ? "bg-primary text-black hover:bg-primary/90" : ""
                    )}
                    onClick={() => setPrintOrientation('landscape')}
                  >
                    Horizontal (Paisagem)
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" onClick={handleDownload} className="flex-col h-auto py-3">
                  <Download className="w-5 h-5 mb-1" />
                  <span className="text-xs">Download</span>
                </Button>
                <Button variant="outline" onClick={handlePrint} className="flex-col h-auto py-3">
                  <Printer className="w-5 h-5 mb-1" />
                  <span className="text-xs">Imprimir</span>
                </Button>
                <Button variant="outline" onClick={handleCopy} className="flex-col h-auto py-3">
                  {copied ? (
                    <Check className="w-5 h-5 mb-1 text-success" />
                  ) : (
                    <Copy className="w-5 h-5 mb-1" />
                  )}
                  <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
                <QrCode className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Preencha os dados ao lado para gerar o QR Code
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-semibold text-foreground">Cadastros Recentes</h2>
          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkGenerateQR}
              className="bg-primary text-black hover:bg-primary/90 animate-scale-in"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Imprimir Selecionados ({selectedIds.length})
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === registrations.length && registrations.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-accent"
                  />
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Motorista</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Ônibus</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Placa</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rota</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Data</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr
                  key={reg.id}
                  className={cn(
                    "border-b border-border/50 hover:bg-accent/50 transition-colors",
                    selectedIds.includes(reg.id) ? "bg-primary/5" : ""
                  )}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(reg.id)}
                      onChange={() => toggleSelect(reg.id)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-accent"
                    />
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium">{reg.driverName}</td>
                  <td className="py-3 px-4 text-foreground">{reg.busNumber}</td>
                  <td className="py-3 px-4 text-primary font-mono">{reg.busPlate}</td>
                  <td className="py-3 px-4 text-foreground">{reg.routeName}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {format(reg.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => handleSelectRegistration(reg)}
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      Ver QR
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
