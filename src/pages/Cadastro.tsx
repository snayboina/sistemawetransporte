import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Copy, Check, MapPin, User, Bus, Route, QrCode } from 'lucide-react';
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
import { mockDrivers, mockBuses, mockRoutes, mockRegistrations } from '@/data/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FormData {
  driverId: string;
  busId: string;
  routeId: string;
  location: string;
}

export default function Cadastro() {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    driverId: '',
    busId: '',
    routeId: '',
    location: '',
  });
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedDriver = mockDrivers.find((d) => d.id === formData.driverId);
  const selectedBus = mockBuses.find((b) => b.id === formData.busId);
  const selectedRoute = mockRoutes.find((r) => r.id === formData.routeId);

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

    const qrData = JSON.stringify({
      id: `TRP-${Date.now()}`,
      driver: selectedDriver?.name,
      bus: selectedBus?.number,
      plate: selectedBus?.plate,
      route: selectedRoute?.name,
      routeCode: selectedRoute?.code,
      location: formData.location,
      createdAt: new Date().toISOString(),
    });

    setGeneratedQR(qrData);
    
    toast({
      title: 'QR Code gerado com sucesso!',
      description: 'O código está pronto para uso.',
    });
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
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `qrcode-${selectedBus?.plate || 'transport'}.png`;
      link.click();
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

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${selectedBus?.plate}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
              background: #fff;
            }
            .info { margin-top: 20px; text-align: center; }
            .info h2 { margin: 0 0 10px; }
            .info p { margin: 5px 0; color: #666; }
          </style>
        </head>
        <body>
          ${svgData}
          <div class="info">
            <h2>${selectedBus?.plate}</h2>
            <p><strong>Motorista:</strong> ${selectedDriver?.name}</p>
            <p><strong>Ônibus:</strong> ${selectedBus?.number}</p>
            <p><strong>Rota:</strong> ${selectedRoute?.name}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Dados da Operação</h2>
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
                  {mockDrivers.map((driver) => (
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
                  {mockBuses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.number} - {bus.plate}
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
                  {mockRoutes.map((route) => (
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
                    level="H"
                    bgColor="#1E2329"
                    fgColor="#FCD535"
                  />
                </div>
              </div>

              {/* Info Summary */}
              <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Motorista</span>
                  <span className="font-medium text-foreground">{selectedDriver?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ônibus</span>
                  <span className="font-medium text-foreground">{selectedBus?.number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Placa</span>
                  <span className="font-medium text-primary">{selectedBus?.plate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rota</span>
                  <span className="font-medium text-foreground">{selectedRoute?.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Localização</span>
                  <span className="font-medium text-foreground truncate max-w-[150px]">
                    {formData.location}
                  </span>
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
        <h2 className="font-semibold text-foreground mb-4">Cadastros Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Motorista</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Ônibus</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Placa</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rota</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {mockRegistrations.map((reg) => (
                <tr key={reg.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-primary">{reg.id}</td>
                  <td className="py-3 px-4 text-foreground">{reg.driverName}</td>
                  <td className="py-3 px-4 text-foreground">{reg.busNumber}</td>
                  <td className="py-3 px-4 text-foreground">{reg.busPlate}</td>
                  <td className="py-3 px-4 text-foreground">{reg.routeName}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {format(reg.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
