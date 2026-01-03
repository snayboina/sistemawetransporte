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
  const { isOnline, pendingCount, saveReading, registrationsList, syncCatalogs } = useOfflineSync();
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
  const [isDivergent, setIsDivergent] = useState(false);
  // const [registrationsList, setRegistrationsList] = useState<any[]>([]); // Agora vem do hook

  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [isSearchingPlates, setIsSearchingPlates] = useState(false);

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

  // Efeito de busca de registros removido pois agora vem do useOfflineSync


  useEffect(() => {
    if (manualId.trim().length >= 2) {
      const search = manualId.toUpperCase();
      const filtered = registrationsList.filter(reg =>
        (reg.buses?.plate?.toUpperCase().includes(search)) ||
        (reg.buses?.bus_number?.toString().includes(search))
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [manualId, registrationsList]);

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
        qrCodeRef.current = new Html5Qrcode("reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
        console.log("Nova instância Html5Qrcode persistente criada.");
      }

      setHasPermission(true);
      isProcessingRef.current = false; // Reseta a trava ao iniciar novo scan

      // Delay de segurança maior para permitir liberação de hardware
      await new Promise(resolve => setTimeout(resolve, 500));

      const width = window.innerWidth;
      const qrboxSize = Math.min(width * 0.8, 300); // Ajustado para ser proporcional e não ultrapassar 300px

      await qrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 25, // Aumentado de 15 para 25 para leitura mais fluida
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0
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

    let qrData: any = {};
    try {
      // Tenta fazer o parse do JSON (formato antigo)
      qrData = JSON.parse(decodedText);
    } catch (e) {
      // Se falhar o parse, assume que é o novo formato (apenas o ID)
      console.log("QR Code não é JSON, tratando como ID puro:", decodedText);

      // Validação básica: IDs no banco são numéricos ou UUIDs
      // Se não for nulo nem vazio, assumimos que é o ID da escala
      if (decodedText && decodedText.trim().length > 0) {
        qrData = { id: decodedText.trim() };
      } else {
        console.error("QR Code vazio ou inválido");
        toast.error("QR Code inválido.");
        isProcessingRef.current = false;
        return;
      }
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
      } else {
        // Offline: Try to find in cached list
        const searchId = qrData.id || qrData.registrationId;
        if (searchId) {
          const found = registrationsList.find(r => r.id === searchId);
          if (found) {
            console.log("Offline: Registration found in cache:", found);
            registration = found;
          }
        }
      }

      await saveReading({
        registration_id: registration?.id || qrData.id || qrData.registrationId || null,
        driver_name: qrData.manualDriverName || registration?.drivers?.name || qrData.driver || qrData.driverName || 'N/A',
        bus_number: registration?.buses?.bus_number || qrData.bus || qrData.busNumber || 'N/A',
        bus_plate: registration?.buses?.plate || qrData.plate || qrData.busPlate || 'N/A',
        route_name: registration?.routes?.name || qrData.route || qrData.routeName || 'N/A',
        location: registration?.location || qrData.location || '0,0',
        reading_location: 'Local Atual',
        read_at: new Date().toISOString(),
        has_divergence: isDivergent,
        real_driver_name: isDivergent ? (qrData.manualDriverName || registration?.drivers?.name) : null
      });

      toast.success("Código lido e sincronizado!", { id: 'saving-scan' });
      setIsSaving(false);
      isProcessingRef.current = false; // Libera a trava após sucesso

      // Limpa os estados para o próximo scan
      setIsDivergent(false);
      setManualId('');
      setManualDriver('');

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

    // Validação: precisa ter pelo menos motorista OU placa
    if (!manualId.trim() && !manualDriver.trim()) {
      toast.error("Digite o nome do motorista OU a placa do ônibus.", { id: 'manual-look' });
      return;
    }

    setIsSaving(true);
    toast.loading("Buscando registro...", { id: 'manual-look' });

    // Modo Offline
    if (!isOnline) {
      // Tenta buscar nos dados em cache (registrationsList)
      let foundRegistration = null;
      const searchId = manualId.trim().toUpperCase();
      const searchDriver = manualDriver.trim().toLowerCase();

      // Normaliza strings para comparação (remove tudo que não for letra ou número)
      const cleanString = (str: string) => str?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '';
      const cleanSearchId = cleanString(manualId);

      // Lógica de busca offline ROBUSTA
      if (manualId.trim() && manualDriver.trim()) {
        // Busca por AMBOS
        foundRegistration = registrationsList.find(r => {
          const dbPlate = cleanString(r.buses?.plate);
          const dbBusNumber = cleanString(String(r.buses?.bus_number));

          const plateMatch = dbPlate.includes(cleanSearchId) || dbBusNumber === cleanSearchId;
          return plateMatch;
        });

        if (foundRegistration) {
          const driverInDb = foundRegistration.drivers?.name?.toLowerCase().trim();
          if (driverInDb && !driverInDb.includes(searchDriver) && !searchDriver.includes(driverInDb)) {
            setIsDivergent(true);
            toast.warning("Offline: Divergência de motorista detectada.", { id: 'manual-look' });
          } else {
            toast.success("Offline: Registro encontrado no cache!", { id: 'manual-look' });
          }
        }
      } else if (manualId.trim()) {
        // Busca só por PLACA (Flexível)
        foundRegistration = registrationsList.find(r => {
          const dbPlate = cleanString(r.buses?.plate);
          const dbBusNumber = cleanString(String(r.buses?.bus_number));

          return dbPlate.includes(cleanSearchId) || dbBusNumber === cleanSearchId;
        });

        if (foundRegistration) toast.success("Offline: Ônibus encontrado no cache!", { id: 'manual-look' });
      } else if (manualDriver.trim()) {
        // Busca só por MOTORISTA
        foundRegistration = registrationsList.find(r =>
          r.drivers?.name?.toLowerCase().includes(searchDriver)
        );
        if (foundRegistration) toast.success("Offline: Motorista encontrado no cache!", { id: 'manual-look' });
      }

      if (foundRegistration) {
        const qrData = {
          id: foundRegistration.id,
          bus: foundRegistration.buses?.bus_number,
          plate: foundRegistration.buses?.plate,
          driver: foundRegistration.drivers?.name,
          manualDriverName: isDivergent ? (document.getElementById('manual-real-driver') as HTMLInputElement)?.value || manualDriver : (manualDriver.trim() || foundRegistration.drivers?.name),
          route: foundRegistration.routes?.name,
          location: foundRegistration.location || '0,0'
        };
        setPreviewData(qrData);
        setIsManualOpen(false);
        setIsSaving(false);
        return;
      }

      // Se não encontrou no cache, salva como desconhecido
      toast.warning("Offline: Não encontrado no cache. Salvando manual.", { id: 'manual-look' });

      const qrData = {
        id: crypto.randomUUID(),
        bus: manualId || 'N/A',
        plate: manualId ? manualId.toUpperCase().replace('-', '') : 'N/A',
        driver: manualDriver || 'N/A (Offline)',
        manualDriverName: manualDriver,
        route: 'N/A (Offline)',
        location: '0,0'
      };

      setPreviewData(qrData);
      setIsManualOpen(false);
      setManualId('');
      setManualDriver('');
      setIsSaving(false);
      return;
    }

    try {
      let registrationData = null;

      // CENÁRIO 1: Busca por MOTORISTA (só nome digitado)
      if (manualDriver.trim() && !manualId.trim()) {
        const { data, error } = await supabase
          .from('registrations')
          // Use !inner para filtrar pela tabela relacionada
          .select('*, drivers!inner(name), buses(bus_number, plate), routes(name)')
          .ilike('drivers.name', `%${manualDriver.trim()}%`)
          // .eq('status', 'active')  <-- Removido para encontrar o ultimo registro mesmo se nao estiver active
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          toast.error(`Motorista "${manualDriver}" não encontrado em nenhuma escala ativa.`, { id: 'manual-look' });
          setIsSaving(false);
          return;
        }

        registrationData = data;
        toast.success(`Ônibus encontrado para ${data.drivers?.name}!`, { id: 'manual-look' });
      }

      // CENÁRIO 2: Busca por PLACA (só placa digitada)
      else if (manualId.trim() && !manualDriver.trim()) {
        let searchTerm = manualId.trim().toUpperCase();

        // Se for 3 letras e 4 números sem hífen, adiciona o hífen para buscar no banco
        // Ex: ABC1234 -> ABC-1234
        if (/^[A-Z]{3}\d{4}$/.test(searchTerm)) {
          searchTerm = searchTerm.replace(/^([A-Z]{3})(\d{4})$/, '$1-$2');
        }

        // Busca o ônibus pela placa formatada ou número
        const { data: busData, error: busError } = await supabase
          .from('buses')
          .select('id, plate, bus_number')
          .or(`plate.ilike.%${searchTerm}%,bus_number.eq.${manualId},plate.ilike.%${manualId}%`) // Tenta c/ hífen, nº, ou original
          .maybeSingle();

        if (busError || !busData) {
          toast.error(`Ônibus "${manualId}" não encontrado. Tente a placa completa (ex: ABC-1234) ou número.`, { id: 'manual-look' });
          setIsSaving(false);
          return;
        }

        // Busca a escala mais recente para esse ônibus
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

        registrationData = data;
        toast.success(`Motorista encontrado: ${data.drivers?.name}!`, { id: 'manual-look' });
      }

      // CENÁRIO 3: Busca por AMBOS (placa + motorista)
      else if (manualId.trim() && manualDriver.trim()) {
        let searchTerm = manualId.trim().toUpperCase();
        if (/^[A-Z]{3}\d{4}$/.test(searchTerm)) {
          searchTerm = searchTerm.replace(/^([A-Z]{3})(\d{4})$/, '$1-$2');
        }

        const { data: busData, error: busError } = await supabase
          .from('buses')
          .select('id, plate, bus_number')
          .or(`plate.ilike.%${searchTerm}%,bus_number.eq.${manualId},plate.ilike.%${manualId}%`)
          .maybeSingle();

        if (busError || !busData) {
          toast.error(`Ônibus "${manualId}" não encontrado.`, { id: 'manual-look' });
          setIsSaving(false);
          return;
        }

        const { data, error } = await supabase
          .from('registrations')
          .select('*, drivers(name), buses(bus_number, plate), routes(name)')
          .eq('bus_id', busData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          toast.error("Nenhuma escala ativa encontrada.", { id: 'manual-look' });
          setIsSaving(false);
          return;
        }

        registrationData = data;

        // Verifica se o motorista digitado é diferente do banco
        const driverInDb = data.drivers?.name?.toLowerCase().trim();
        const driverTyped = manualDriver.toLowerCase().trim();

        if (driverInDb && !driverInDb.includes(driverTyped) && !driverTyped.includes(driverInDb)) {
          setIsDivergent(true);
          toast.warning("Divergência detectada! O motorista digitado é diferente do banco.", { id: 'manual-look' });
        } else {
          toast.success("Registro encontrado!", { id: 'manual-look' });
        }
      }

      // Monta os dados para o preview
      if (registrationData) {
        const manualRealDriver = (document.getElementById('manual-real-driver') as HTMLInputElement)?.value;
        const qrData = {
          id: registrationData.id,
          bus: registrationData.buses?.bus_number,
          plate: registrationData.buses?.plate,
          driver: registrationData.drivers?.name,
          manualDriverName: isDivergent ? manualRealDriver : (manualDriver.trim() || registrationData.drivers?.name),
          route: registrationData.routes?.name,
          location: registrationData.location || '0,0'
        };

        setPreviewData(qrData);
        setIsManualOpen(false);
        setIsSaving(false);
      }

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

                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 transition-all">
                    <Icon name="database" size={12} className={registrationsList.length > 0 ? "text-green-400" : "text-gray-500"} />
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                      Base Offline: <span className={registrationsList.length > 0 ? "text-white" : "text-gray-500"}>{registrationsList.length}</span>
                    </p>
                  </div>

                  {isOnline && (
                    <button
                      onClick={async () => {
                        const loadingId = toast.loading("Baixando dados do servidor...");
                        await syncCatalogs(); // Chama a função que agora está exposta
                        toast.dismiss(loadingId);
                        toast.success("Dados atualizados!");
                      }}
                      className="text-[10px] text-primary font-bold uppercase tracking-widest border-b border-primary/30 hover:text-white hover:border-white transition-colors pb-0.5"
                    >
                      Atualizar Base
                    </button>
                  )}
                </div>
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

              {/* Status Offline e Atualização Manual */}
              <div className="mb-6 flex flex-col items-center gap-2 w-full">
                <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 transition-all w-full justify-center">
                  <Icon name="database" size={12} className={registrationsList.length > 0 ? "text-green-400" : "text-gray-500"} />
                  <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                    Base Offline: <span className={registrationsList.length > 0 ? "text-white" : "text-gray-500"}>{registrationsList.length}</span>
                  </p>
                </div>

                {isOnline && (
                  <button
                    type="button"
                    onClick={async () => {
                      const loadingId = toast.loading("Baixando dados do servidor...");
                      await syncCatalogs();
                      toast.dismiss(loadingId);
                      toast.success("Dados atualizados!");
                    }}
                    className="text-[10px] text-primary font-bold uppercase tracking-widest border-b border-primary/30 hover:text-white hover:border-white transition-colors pb-0.5"
                  >
                    Atualizar Base Agora
                  </button>
                )}
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 text-left relative">
                    <label className="text-[10px] text-gray-400 uppercase font-black ml-1 tracking-wider">Ônibus (Placa ou ID)</label>
                    <input
                      type="text"
                      value={manualId}
                      onChange={(e) => {
                        setManualId(e.target.value);
                        setIsSearchingPlates(true);
                      }}
                      onFocus={() => setIsSearchingPlates(true)}
                      placeholder="Ex: ABC1234"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-center text-xl focus:border-primary/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-gray-700"
                      autoFocus
                    />

                    {/* Plate Suggestions Dropdown */}
                    {isSearchingPlates && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden z-[60] shadow-2xl">
                        {filteredSuggestions.map((reg) => (
                          <button
                            key={reg.id}
                            type="button"
                            onClick={() => {
                              setManualId(reg.buses?.plate || reg.buses?.bus_number?.toString() || '');
                              setManualDriver(reg.drivers?.name || '');
                              setIsSearchingPlates(false);
                            }}
                            className="w-full px-5 py-4 text-left hover:bg-white/5 border-b border-white/5 flex items-center justify-between transition-colors"
                          >
                            <div>
                              <p className="text-white font-black">{reg.buses?.plate}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">{reg.drivers?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-primary font-bold text-xs">#{reg.buses?.bus_number}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {manualId && (
                    <div className="space-y-4 animate-scale-in">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] text-gray-400 uppercase font-black ml-1 tracking-wider">Motorista Cadastrado</label>
                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-gray-400 font-bold text-center text-lg">
                          {manualDriver || 'Nenhum motorista encontrado'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 cursor-pointer" onClick={() => setIsDivergent(!isDivergent)}>
                        <input
                          type="checkbox"
                          checked={isDivergent}
                          onChange={(e) => setIsDivergent(e.target.checked)}
                          className="w-5 h-5 accent-amber-500 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Motorista diferente hoje?</span>
                      </div>

                      {isDivergent && (
                        <div className="space-y-2 text-left animate-scale-in">
                          <label className="text-[10px] text-amber-400 uppercase font-black ml-1 tracking-wider">Nome do Motorista Atual</label>
                          <input
                            type="text"
                            placeholder="Quem está dirigindo agora?"
                            className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl py-4 px-5 text-white font-bold text-center text-lg focus:border-amber-500/50 focus:bg-amber-500/10 focus:outline-none transition-all placeholder:text-gray-700"
                            required={isDivergent}
                            onChange={(e) => {
                              // Adicionaremos um campo para o nome real se necessário no preview
                              // Por enquanto usamos o previewData para isso
                            }}
                            id="manual-real-driver"
                          />
                        </div>
                      )}
                    </div>
                  )}
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

                {/* Checkbox de Divergência */}
                {previewData.driver && previewData.manualDriverName && previewData.driver !== previewData.manualDriverName && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        id="divergent-checkbox"
                        checked={isDivergent}
                        onChange={(e) => setIsDivergent(e.target.checked)}
                        className="w-6 h-6 mt-1 accent-amber-500 cursor-pointer"
                      />
                      <label htmlFor="divergent-checkbox" className="flex-1 cursor-pointer">
                        <p className="text-amber-400 font-black text-sm uppercase tracking-wider mb-1">
                          ⚠️ Motorista Diferente
                        </p>
                        <p className="text-gray-300 text-xs leading-relaxed">
                          O motorista no banco é <span className="font-bold text-white">{previewData.driver}</span>, mas você digitou <span className="font-bold text-amber-400">{previewData.manualDriverName}</span>. Marque esta opção para registrar a divergência.
                        </p>
                      </label>
                    </div>
                  </div>
                )}
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
                    setIsDivergent(false);
                    setManualId('');
                    setManualDriver('');
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <p className="text-xs text-primary font-bold uppercase tracking-widest">
                {pendingCount} {pendingCount === 1 ? 'Leitura Pendente' : 'Leituras Pendentes'}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 mt-4">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
              <Icon name="database" size={14} className="text-gray-400" />
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                Base Offline: <span className="text-white">{registrationsList.length}</span> registros
              </p>
            </div>
          </div>
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
