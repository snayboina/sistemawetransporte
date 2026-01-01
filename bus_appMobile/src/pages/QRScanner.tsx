import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import scannerBg from '@/assets/scanner-background.jpg';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { toast } from 'sonner';

const QRScanner = () => {
  const navigate = useNavigate();
  const { isOnline, pendingCount, saveReading } = useOfflineSync();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Criar a instância mas não iniciar automaticamente
    qrCodeRef.current = new Html5Qrcode("reader");

    return () => {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current.stop().catch(err => console.error("Erro ao parar scanner", err));
      }
    };
  }, []);

  const startScanner = async () => {
    if (!qrCodeRef.current) return;

    try {
      setIsScanning(true);
      setHasPermission(true);

      await qrCodeRef.current.start(
        { facingMode: "environment" }, // Forçar câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );
    } catch (error: any) {
      console.error("Erro ao iniciar câmera:", error);
      setIsScanning(false);
      const errorStr = String(error);
      if (errorStr.includes("NotAllowedError") || errorStr.includes("Permission denied")) {
        setHasPermission(false);
        toast.error("Permissão de câmera negada. Verifique as configurações do navegador.");
      } else {
        toast.error("Erro ao acessar a câmera. Tente recarregar a página.");
      }
    }
  };

  const stopScanner = async () => {
    if (qrCodeRef.current && qrCodeRef.current.isScanning) {
      try {
        await qrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Erro ao parar câmera", err);
      }
    }
  };

  async function onScanSuccess(decodedText: string) {
    console.log(`Scan result: ${decodedText}`);

    // Parar o scanner imediatamente
    await stopScanner();

    toast.success("Código lido com sucesso!");

    try {
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (e) {
        console.error("QR Code não contém um JSON válido", e);
        toast.error("QR Code inválido (formato incompatível)");
        startScanner(); // Reiniciar se falhar o parse
        return;
      }

      // 1. Procurar o cadastro no Supabase (se online)
      let registration = null;
      if (isOnline) {
        const { data, error } = await supabase
          .from('registrations')
          .select('*, drivers(name), buses(bus_number, plate), routes(name)')
          .eq('id', qrData.id || qrData.registrationId)
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
        reading_location: 'Local Atual',
        read_at: new Date().toISOString()
      });

      toast.success("Leitura registrada!");

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error("Erro ao processar scan:", error);
      toast.error("Erro ao salvar a leitura");
      startScanner(); // Reiniciar em caso de erro no processo
    }
  }

  function onScanFailure(error: any) {
    // Ignorar erros de frames ruins
  }

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden relative">
      {/* Header UI */}
      <div className="relative z-20 flex flex-col h-full w-full max-w-md mx-auto min-h-screen">
        <div className="flex items-center justify-between p-5 pt-8">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white backdrop-blur-md"
          >
            <Icon name="close" size={24} />
          </Link>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm border ${isOnline ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[10px] font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Scanner Viewport */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-6">
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl font-bold mb-2">
              Scanner de QR Code
            </h2>
            <p className="text-gray-400 text-sm">
              Aponte para o código colado no ônibus
            </p>
          </div>

          <div className="relative w-full aspect-square max-w-[320px] bg-gray-900 rounded-3xl border-2 border-primary/20 overflow-hidden shadow-2xl">
            <div id="reader" className="w-full h-full" />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 z-30 p-8 text-center">
                {hasPermission === false ? (
                  <>
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                      <Icon name="block" size={32} className="text-red-500" />
                    </div>
                    <p className="text-white font-medium mb-4">Acesso à câmera negado</p>
                    <p className="text-gray-400 text-sm mb-6">Por favor, habilite a permissão nas configurações do seu navegador.</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full py-4 bg-white/10 text-white rounded-xl font-bold border border-white/20"
                    >
                      Recarregar Página
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <Icon name="photo_camera" size={32} className="text-primary" />
                    </div>
                    <p className="text-white font-medium mb-6">Pronto para iniciar a leitura</p>
                    <button
                      onClick={startScanner}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      Ativar Câmera
                    </button>
                  </>
                )}
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute left-6 right-6 h-0.5 bg-primary shadow-[0_0_15px_rgba(252,213,53,0.5)] animate-scan-vertical" />
                <div className="absolute top-4 left-4 w-10 h-10 border-l-4 border-t-4 border-primary rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-10 h-10 border-r-4 border-t-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-10 h-10 border-l-4 border-b-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-10 h-10 border-r-4 border-b-4 border-primary rounded-br-lg" />
              </div>
            )}
          </div>

          {isScanning && (
            <button
              onClick={stopScanner}
              className="mt-8 px-6 py-2 bg-white/10 text-white rounded-full border border-white/20 text-sm font-medium"
            >
              Parar Scanner
            </button>
          )}
        </div>

        {/* Bottom Stats */}
        <div className="p-10 text-center">
          {pendingCount > 0 && (
            <p className="text-xs text-gray-400">
              Você tem <span className="text-primary font-bold">{pendingCount}</span> leitura(s) aguardando sincronização.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
