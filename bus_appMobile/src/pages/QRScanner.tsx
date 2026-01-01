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
  const [autoSend, setAutoSend] = useState(() => {
    const saved = localStorage.getItem('swiftride_auto_send');
    return saved === null ? true : saved === 'true';
  });
  const autoSendRef = useRef(autoSend);
  const isProcessingRef = useRef(false); // Trava para evitar scans duplicados
  const [previewData, setPreviewData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualId, setManualId] = useState('');
  const [manualDriver, setManualDriver] = useState('');
  const qrCodeRef = useRef<Html5Qrcode | null>(null);

  // Sincroniza o Ref com o State
  useEffect(() => {
    autoSendRef.current = autoSend;
    localStorage.setItem('swiftride_auto_send', String(autoSend));
  }, [autoSend]);

  // Função para tocar o som de "pip" (Beep)
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(2200, audioCtx.currentTime); // Tom mais agudo
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08); // Mais curto

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn("Não foi possível tocar o som de feedback", e);
    }
  };

  // Efeito removido pois foi mesclado acima no useEffect do autoSend

  useEffect(() => {
    return () => {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current.stop().catch(err => console.error("Erro ao parar scanner", err));
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setPreviewData(null);
      console.log("Solicitando startScanner...");

      // Se já está escaneando, não faz nada
      if (qrCodeRef.current?.isScanning) {
        console.log("Já existe uma sessão de scan ativa.");
        return;
      }

      // Garante que o elemento existe
      const element = document.getElementById("reader");
      if (!element) {
        console.warn("Elemento 'reader' não encontrado no DOM. Aguardando...");
        setTimeout(startScanner, 300);
        return;
      }

      // Cria a instância se não existir, mas NÃO a apaga no stop
      if (!qrCodeRef.current) {
        qrCodeRef.current = new Html5Qrcode("reader");
        console.log("Nova instância Html5Qrcode persistente criada.");
      }

      setHasPermission(true);
      isProcessingRef.current = false; // Reseta a trava ao iniciar novo scan

      // Delay de segurança maior para permitir liberação de hardware
      await new Promise(resolve => setTimeout(resolve, 500));

      const width = window.innerWidth;
      const qrboxSize = Math.max(250, Math.floor(width * 0.7));

      await qrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 15, // Reduzido para maior estabilidade em dispositivos lentos
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );

      setIsScanning(true);
      console.log("Scanner iniciado com sucesso.");
    } catch (error: any) {
      console.error("Erro fatal ao iniciar câmera:", error);
      setIsScanning(false);

      const errorStr = String(error);
      if (errorStr.includes("NotAllowedError") || errorStr.includes("Permission denied")) {
        setHasPermission(false);
        toast.error("Permissão de câmera negada.");
      } else {
        // Se falhou por 'Already scanning', tenta resetar o estado interno
        if (errorStr.includes("Already scanning")) {
          console.log("Detectado conflito 'Already scanning'. Tentando recuperar...");
          setIsScanning(true);
        } else {
          toast.error("Conexão com a câmera falhou. Tente novamente.");
        }
      }
    }
  };

  const stopScanner = async () => {
    console.log("Chamando stopScanner...");
    if (qrCodeRef.current) {
      try {
        if (qrCodeRef.current.isScanning) {
          await qrCodeRef.current.stop();
          console.log("Scanner parado com sucesso.");
        }
      } catch (err) {
        console.warn("Aviso ao parar câmera (pode já estar parada):", err);
      }
      setIsScanning(false);
    }
  };

  async function onScanSuccess(decodedText: string) {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true; // Ativa a trava imediatamente

    console.log(`Scan result: ${decodedText}`);
    playBeep();

    let qrData;
    try {
      qrData = JSON.parse(decodedText);
    } catch (e) {
      console.error("QR Code não contém um JSON válido", e);
      toast.error("Formato de QR Code incompatível.");
      isProcessingRef.current = false; // Libera a trava se falhar o parse
      return;
    }

    const isDirectMode = autoSendRef.current; // Captura o modo no momento do scan

    if (isDirectMode) {
      await stopScanner();
      await processAndSave(qrData, true);
    } else {
      await stopScanner();
      setPreviewData(qrData);
      // Mantém isProcessingRef.current como true para evitar scans de fundo 
      // enquanto o preview está na tela.
    }
  }

  async function processAndSave(qrData: any, isDirect: boolean = false) {
    setIsSaving(true);
    toast.loading("Processando leitura...", { id: 'saving-scan' });

    try {
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
        driver_name: qrData.manualDriverName || registration?.drivers?.name || qrData.driver || qrData.driverName || 'N/A',
        bus_number: registration?.buses?.bus_number || qrData.bus || qrData.busNumber || 'N/A',
        bus_plate: registration?.buses?.plate || qrData.plate || qrData.busPlate || 'N/A',
        route_name: registration?.routes?.name || qrData.route || qrData.routeName || 'N/A',
        location: registration?.location || qrData.location || '0,0',
        reading_location: 'Local Atual',
        read_at: new Date().toISOString()
      });

      toast.success("Código lido e sincronizado!", { id: 'saving-scan' });
      setIsSaving(false);
      isProcessingRef.current = false; // Libera a trava após sucesso

      if (isDirect) {
        // No modo direto, apenas reinicia o scanner para a próxima leitura sem sair da tela
        console.log("Fluxo Direto concluído. Reiniciando...");
        setTimeout(() => {
          startScanner();
        }, 100);
      } else {
        // No modo manual, volta para a home após confirmar
        console.log("Fluxo Confirmar concluído. Navegando para a Home...");
        setTimeout(() => {
          navigate('/');
        }, 500);
      }

    } catch (error) {
      console.error("Erro ao processar scan:", error);
      toast.error("Erro ao salvar leitura.", { id: 'saving-scan' });
      setIsSaving(false);
      isProcessingRef.current = false; // Libera a trava em caso de erro

      // Se deu erro, volta para o scanner para tentar novamente
      setTimeout(() => {
        startScanner();
      }, 500);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualId.trim()) return;

    setIsSaving(true);
    toast.loading("Buscando registro...", { id: 'manual-look' });

    if (!isOnline) {
      toast.success("Modo Offline: Registro manual salvo localmente.", { id: 'manual-look' });

      const qrData = {
        id: crypto.randomUUID(),
        bus: manualId,
        plate: manualId.toUpperCase(),
        driver: 'N/A (Offline)',
        route: 'N/A (Offline)',
        location: '0,0'
      };

      setPreviewData(qrData);
      setIsManualOpen(false);
      setManualId('');
      return;
    }

    try {
      // 1. Busca primeiro o ônibus pela placa ou número
      const { data: busData, error: busError } = await supabase
        .from('buses')
        .select('id, plate, bus_number')
        .or(`plate.eq.${manualId.toUpperCase()},bus_number.eq.${manualId}`)
        .maybeSingle();

      if (busError || !busData) {
        toast.error("Ônibus não encontrado no sistema.", { id: 'manual-look' });
        setIsSaving(false);
        return;
      }

      // 2. Busca a escala (registration) mais recente para esse ônibus
      const { data, error } = await supabase
        .from('registrations')
        .select('*, drivers(name), buses(bus_number, plate), routes(name)')
        .eq('bus_id', busData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        toast.error("Nenhuma escala ativa encontrada para este ônibus.", { id: 'manual-look' });
        setIsSaving(false);
        return;
      }

      toast.success("Registro encontrado!", { id: 'manual-look' });

      const qrData = {
        id: data.id,
        bus: data.buses?.bus_number,
        plate: data.buses?.plate,
        driver: data.drivers?.name,
        manualDriverName: manualDriver.trim() || data.drivers?.name,
        route: data.routes?.name,
        location: data.location || '0,0'
      };

      // REGISTRO MANUAL: Sempre mostra preview para conferência, 
      // ignorando o modo Direto para evitar envios acidentais por erro de digitação.
      setPreviewData(qrData);
      setIsManualOpen(false);
      setManualId('');
      setManualDriver('');
      setIsSaving(false);

    } catch (err) {
      console.error("Erro no registro manual:", err);
      toast.error("Erro ao buscar dados.", { id: 'manual-look' });
      setIsSaving(false);
    }
  }

  function onScanFailure(error: any) { }

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden relative">
      <div className="relative z-20 flex flex-col h-full w-full max-w-md mx-auto min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pt-8">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white backdrop-blur-md"
          >
            <Icon name="close" size={24} />
          </Link>

          <div className="flex items-center gap-4">
            {/* Auto-Send Toggle */}
            <button
              onClick={() => setAutoSend(!autoSend)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all ${autoSend ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/10 border-white/20 text-gray-400'}`}
            >
              <Icon name={autoSend ? "bolt" : "visibility"} size={14} />
              <span className="text-[10px] font-bold uppercase">{autoSend ? 'Direto' : 'Confirmar'}</span>
            </button>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border ${isOnline ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[10px] font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative px-4 pb-20">
          {/* Scanner Area - Persistente no DOM */}
          <div className={`w-full max-w-[340px] flex flex-col items-center transition-all duration-300 ${previewData ? 'opacity-0 scale-95 pointer-events-none absolute invisible' : 'opacity-100 scale-100 relative visible'}`}>
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold mb-2">
                Scanner de QR Code
              </h2>
              <p className="text-gray-400 text-sm">
                {autoSend ? "Escanear e enviar agora" : "Escaneie para conferir os dados"}
              </p>
            </div>

            <div className="relative w-full aspect-square bg-gray-900 rounded-3xl border-2 border-primary/30 overflow-hidden shadow-2xl">
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
                        className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-black"
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

            {isScanning && !previewData && (
              <div className="flex flex-col gap-3 mt-8 w-full">
                <button
                  onClick={stopScanner}
                  className="w-full px-8 py-4 bg-red-500/20 text-red-500 rounded-2xl border border-red-500/40 text-sm font-bold"
                >
                  PARAR CAMERA
                </button>
                <button
                  onClick={() => { stopScanner(); setIsManualOpen(true); }}
                  className="w-full px-8 py-4 bg-white/10 text-white rounded-2xl border border-white/20 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Icon name="keyboard" size={18} />
                  DIGITAR PLACA/ID
                </button>
              </div>
            )}
          </div>

          {/* Manual Entry Modal/View */}
          {isManualOpen && (
            <div className="w-full max-w-[340px] animate-scale-in bg-[#1a1f2e]/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] z-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(252,213,53,0.2)]">
                  <Icon name="keyboard" className="text-primary" size={32} />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl leading-tight text-left">Registro Manual</h3>
                  <p className="text-gray-400 text-xs text-left">Preencha os dados abaixo</p>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-gray-400 uppercase font-black ml-1 tracking-wider">Ônibus (Placa ou ID)</label>
                    <input
                      type="text"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      placeholder="Ex: ABC1234"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-center text-xl focus:border-primary/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-gray-700"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-gray-400 uppercase font-black ml-1 tracking-wider">Nome do Motorista (Opcional)</label>
                    <input
                      type="text"
                      value={manualDriver}
                      onChange={(e) => setManualDriver(e.target.value)}
                      placeholder="Nome do motorista"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold text-center text-lg focus:border-primary/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-gray-700"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-5 bg-primary text-black rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(252,213,53,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Icon name="search" />
                        BUSCAR E REGISTRAR
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsManualOpen(false); setManualId(''); setManualDriver(''); startScanner(); }}
                    disabled={isSaving}
                    className="w-full py-2 text-white font-bold opacity-40 hover:opacity-100 transition-all text-sm uppercase tracking-widest"
                  >
                    CANCELAR
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preview Area - Only shown when previewData exists */}
          {previewData && (
            <div className="w-full max-w-[340px] animate-scale-in bg-[#1a1f2e]/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(252,213,53,0.2)]">
                  <Icon name="fact_check" className="text-primary" size={32} />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl leading-tight text-left">Conferir Dados</h3>
                  <p className="text-gray-400 text-xs text-left">Confirme as informações</p>
                </div>
              </div>

              <div className="space-y-5 mb-10">
                <div className="bg-white/5 rounded-[1.5rem] p-5 border border-white/5 shadow-inner">
                  <p className="text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Veículo Identificado</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-primary font-black text-2xl tracking-tighter">{previewData.plate || 'N/A'}</p>
                    <span className="text-gray-400 font-bold text-sm">#{previewData.bus || 'N/A'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 px-1">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-10 bg-primary/20 rounded-full" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Motorista</p>
                      <p className="text-white font-bold text-base leading-tight">
                        {previewData.manualDriverName || previewData.driver || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-2 h-10 bg-blue-500/20 rounded-full" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Rota</p>
                      <p className="text-white font-bold text-base leading-tight truncate w-[200px]">
                        {previewData.route || 'Sem Rota Definida'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => processAndSave(previewData)}
                  disabled={isSaving}
                  className="w-full py-5 bg-primary text-black rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(252,213,53,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Icon name="check_circle" />
                      CONFIRMAR REGISTRO
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    isProcessingRef.current = false;
                    setPreviewData(null);
                    startScanner();
                  }}
                  disabled={isSaving}
                  className="w-full py-2 text-white font-bold opacity-40 hover:opacity-100 transition-all text-sm uppercase tracking-widest"
                >
                  DESCARTAR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-10 text-center pb-12">
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
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
    </div>
  );
};

export default QRScanner;
