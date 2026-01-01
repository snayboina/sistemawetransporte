import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import scannerBg from '@/assets/scanner-background.jpg';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { toast } from 'sonner';

const QRScanner = () => {
  const navigate = useNavigate();
  const { isOnline, pendingCount, saveReading } = useOfflineSync();
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0], // 0: CAMERA
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Falha ao limpar scanner", err));
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    console.log(`Scan result: ${decodedText}`);

    // Stop scanning to prevent multiple triggers
    if (scannerRef.current) {
      scannerRef.current.pause(true);
    }

    setIsScanning(false);
    toast.success("Código lido com sucesso!");

    try {
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (e) {
        console.error("QR Code não contém um JSON válido", e);
        toast.error("QR Code inválido (formato incompatível)");
        if (scannerRef.current) scannerRef.current.resume();
        setIsScanning(true);
        return;
      }

      // 1. Procurar o cadastro no Supabase (se online)
      let registration = null;
      if (isOnline) {
        const { data, error } = await supabase
          .from('registrations')
          .select('*, drivers(name), buses(bus_number, plate), routes(name)')
          .eq('id', qrData.id || qrData.registrationId) // Tentar os dois nomes comuns
          .single();

        if (!error && data) {
          registration = data;
        }
      }

      // 2. Salvar a leitura (Offline ou Online)
      await saveReading({
        registration_id: registration?.id || qrData.id || qrData.registrationId || crypto.randomUUID(),
        driver_name: registration?.drivers?.name || qrData.driver || qrData.driverName || 'N/A',
        bus_number: registration?.buses?.bus_number || qrData.bus || qrData.busNumber || 'N/A',
        bus_plate: registration?.buses?.plate || qrData.plate || qrData.busPlate || 'N/A',
        route_name: registration?.routes?.name || qrData.route || qrData.routeName || 'N/A',
        location: registration?.location || qrData.location || '0,0',
        reading_location: 'Local Atual', // Poderia usar GPS aqui se solicitado
        read_at: new Date().toISOString()
      });

      toast.success("Leitura registrada!");

      // Navigate to details or home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      console.error("Erro ao processar scan:", error);
      toast.error("Erro ao salvar a leitura");
      if (scannerRef.current) scannerRef.current.resume();
      setIsScanning(true);
    }
  }

  function onScanFailure(error: any) {
    // Silence errors to avoid console flood, unless critical
    // console.warn(`QR scan error: ${error}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div id="reader-bg" className="w-full h-full bg-black" />
        <div className="absolute inset-0 scanner-backdrop" />
      </div>

      {/* UI Interface */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pt-8">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-background/40 text-foreground backdrop-blur-md hover:bg-foreground/20 transition-colors duration-200"
          >
            <Icon name="close" size={24} />
          </Link>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm border ${isOnline ? 'bg-success/20 border-success/30 text-success' : 'bg-destructive/20 border-destructive/30 text-destructive'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {pendingCount > 0 && (
              <div className="px-3 py-1 bg-primary/20 rounded-full backdrop-blur-sm border border-primary/30 text-primary">
                <span className="text-[10px] font-bold uppercase tracking-wider">{pendingCount} Pendente(s)</span>
              </div>
            )}
          </div>

          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-background/40 text-primary backdrop-blur-md hover:bg-primary/20 transition-colors duration-200 neon-border border border-primary/20">
            <Icon name="flash_on" size={24} filled />
          </button>
        </div>

        {/* Scanner Container */}
        <div className="flex-1 flex flex-col items-center justify-center relative -mt-16">
          <h2 className="text-foreground text-2xl font-bold tracking-tight mb-8 text-shadow-dark text-center px-6">
            {!isScanning ? 'Processando leitura...' : 'Centralize o QR Code'}
          </h2>

          {/* This is where html5-qrcode will render */}
          <div className="relative w-[320px] h-[320px] bg-black overflow-hidden rounded-3xl border-2 border-primary/20 shadow-2xl shadow-primary/10">
            <div id="reader" className="w-full h-full" />

            {/* Aesthetic Overlays */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Scanning Laser Line (only when scanning) */}
              {isScanning && (
                <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_hsl(var(--primary))] animate-scan-vertical" />
              )}

              {/* Corner Brackets */}
              <div className="absolute top-4 left-4 w-10 h-10 border-l-[3px] border-t-[3px] border-primary rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-10 h-10 border-r-[3px] border-t-[3px] border-primary rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-l-[3px] border-b-[3px] border-primary rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-r-[3px] border-b-[3px] border-primary rounded-br-lg" />
            </div>
          </div>

          <div className="mt-8 px-4 py-2 bg-background/40 backdrop-blur-md rounded-full border border-border/30">
            <p className="text-muted-foreground text-sm font-medium leading-normal text-center">
              Aponte a câmera para os dados do ônibus
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 pb-10 w-full bg-gradient-to-t from-background/80 to-transparent">
          <div className="flex items-center justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-surface/80 border border-primary/30 rounded-full text-foreground/80 font-medium backdrop-blur-md hover:bg-primary/20 hover:text-primary transition-all duration-300"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
