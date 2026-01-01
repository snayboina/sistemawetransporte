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

  // Função para tocar o som de "pip" (Beep)
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Frequência do bipe
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn("Não foi possível tocar o som de feedback", e);
    }
  };

  useEffect(() => {
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

      const width = window.innerWidth;
      const qrboxSize = Math.max(250, Math.floor(width * 0.7));

      await qrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 20,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
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
        toast.error("Permissão de câmera negada.");
      } else {
        toast.error("Erro ao acessar a câmera.");
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

    playBeep(); // Tocar o som IMEDIATAMENTE após a leitura
    await stopScanner();
    toast.success("Código lido!");

    try {
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (e) {
        console.error("QR Code não contém um JSON válido", e);
        toast.error("Formato de QR Code incompatível.");
        startScanner();
        return;
      }

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

      setTimeout(() => {
        navigate('/');
      }, 800);

    } catch (error) {
      console.error("Erro ao processar scan:", error);
      toast.error("Erro ao salvar leitura.");
      startScanner();
    }
  }

  function onScanFailure(error: any) { }

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden relative">
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

        <div className="flex-1 flex flex-col items-center justify-center relative px-4">
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl font-bold mb-2">
              Scanner de QR Code
            </h2>
            <p className="text-gray-400 text-sm">
              Centralize o código na área demarcada
            </p>
          </div>

          <div className="relative w-full max-w-[340px] aspect-square bg-gray-900 rounded-3xl border-2 border-primary/30 overflow-hidden shadow-2xl">
            <div id="reader" className="w-full h-full" />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 z-30 p-8 text-center">
                {hasPermission === false ? (
                  <>
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                      <Icon name="block" size={32} className="text-red-500" />
                    </div>
                    <p className="text-white font-medium mb-2">Acesso à câmera negado</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full py-4 bg-white/10 text-white rounded-xl font-bold border border-white/20"
                    >
                      Recarregar Página
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/30 animate-pulse">
                      <Icon name="photo_camera" size={40} className="text-primary" />
                    </div>
                    <p className="text-white font-bold text-lg mb-8">Scanner Pronto</p>
                    <button
                      onClick={startScanner}
                      className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      INICIAR LEITURA
                    </button>
                  </>
                )}
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute left-4 right-4 h-[2px] bg-primary shadow-[0_0_20px_#FCD535] animate-scan-vertical z-30" />
                <div className="absolute top-6 left-6 w-12 h-12 border-l-[6px] border-t-[6px] border-primary rounded-tl-lg shadow-[-2px_-2px_10px_rgba(252,213,53,0.4)]" />
                <div className="absolute top-6 right-6 w-12 h-12 border-r-[6px] border-t-[6px] border-primary rounded-tr-lg shadow-[2px_-2px_10px_rgba(252,213,53,0.4)]" />
                <div className="absolute bottom-6 left-6 w-12 h-12 border-l-[6px] border-b-[6px] border-primary rounded-bl-lg shadow-[-2px_2px_10px_rgba(252,213,53,0.4)]" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-r-[6px] border-b-[6px] border-primary rounded-br-lg shadow-[2px_2px_10px_rgba(252,213,53,0.4)]" />
                <div className="absolute inset-0 border-[40px] border-black/40" />
              </div>
            )}
          </div>

          {isScanning && (
            <button
              onClick={stopScanner}
              className="mt-10 px-8 py-3 bg-red-500/20 text-red-500 rounded-full border border-red-500/40 text-sm font-bold"
            >
              CANCELAR
            </button>
          )}
        </div>

        <div className="p-10 text-center">
          {pendingCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <p className="text-xs text-primary font-bold uppercase tracking-widest">
                {pendingCount} Pendente(s)
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
                @keyframes scan-vertical {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                }
                .animate-scan-vertical {
                    animation: scan-vertical 2.5s ease-in-out infinite;
                }
                #reader video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 20px;
                }
                #reader {
                    border: none !important;
                }
            `}</style>
    </div>
  );
};

export default QRScanner;
