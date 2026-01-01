import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReadingsHistory = () => {
    const { getDailyReadings, isOnline, syncData } = useOfflineSync();
    const [readings, setReadings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredReadings, setFilteredReadings] = useState<any[]>([]);

    const loadReadings = async () => {
        setIsLoading(true);
        const data = await getDailyReadings();
        setReadings(data);
        setFilteredReadings(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadReadings();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredReadings(readings);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = readings.filter(reg =>
            reg.driver_name?.toLowerCase().includes(term) ||
            reg.bus_plate?.toLowerCase().includes(term) ||
            reg.bus_number?.toLowerCase().includes(term)
        );
        setFilteredReadings(filtered);
    }, [searchTerm, readings]);

    const handleSync = async () => {
        await syncData();
        loadReadings();
    };

    return (
        <div className="min-h-screen bg-[#1a1f2e] flex flex-col text-white relative">
            {/* Background Glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FCD535]/5 blur-[130px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/5 blur-[130px] rounded-full pointer-events-none"></div>

            <div className="pt-12 bg-[#252b3b]/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50 shadow-2xl">
                <div className="p-6 flex items-center justify-between pb-6">
                    <Link to="/" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
                        <Icon name="arrow_back" size={24} />
                    </Link>
                    <h1 className="text-2xl font-black tracking-tighter">Leituras de Hoje</h1>
                    {isOnline && readings.some(r => r.status === 'pending') ? (
                        <button
                            onClick={handleSync}
                            className="w-12 h-12 rounded-2xl bg-[#FCD535] text-black flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(252,213,53,0.3)] active:scale-90 transition-all"
                            title="Sincronizar agora"
                        >
                            <Icon name="sync" size={24} />
                        </button>
                    ) : (
                        <div className="w-12" />
                    )}
                </div>

                {/* Search Bar - Modern Look */}
                <div className="px-6 pb-6">
                    <div className="relative group">
                        <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FCD535] transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar motorista ou placa..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-base font-medium focus:outline-none focus:border-[#FCD535]/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 z-10">
                {!isOnline && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 flex items-center gap-4 backdrop-blur-md">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <Icon name="cloud_off" className="text-red-400" size={20} />
                        </div>
                        <p className="text-xs text-red-200 font-medium leading-tight">Você está offline. As leituras serão sincronizadas automaticamente ao restaurar a conexão.</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <div className="w-12 h-12 border-4 border-[#FCD535] border-t-transparent rounded-full animate-spin mb-6" />
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Carregando...</p>
                    </div>
                ) : filteredReadings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                            <Icon name="history" size={40} className="text-gray-600" />
                        </div>
                        <p className="text-xl font-black text-white mb-2">
                            {searchTerm ? "Sem resultados" : "Histórico Vazio"}
                        </p>
                        <p className="text-gray-500 text-sm max-w-[200px] font-medium">
                            {searchTerm ? "Tente outro termo de busca." : "As leituras realizadas hoje aparecerão aqui."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredReadings.map((reg) => (
                            <div key={reg.id} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] backdrop-blur-md hover:bg-white/10 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCD535]/5 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-[#FCD535]/10 transition-all"></div>

                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-[#FCD535] font-black text-2xl tracking-tighter">{reg.bus_plate}</p>
                                            {reg.bus_number && (
                                                <span className="text-[10px] bg-white/10 px-2 py-1 rounded-lg text-gray-400 font-bold uppercase tracking-widest border border-white/5">#{reg.bus_number}</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-mono tracking-tighter opacity-60">ID: {reg.registration_id.slice(0, 8)}...</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-black text-white mb-2">
                                            {format(new Date(reg.read_at), "HH:mm", { locale: ptBR })}
                                        </p>
                                        {reg.status === 'synced' ? (
                                            <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 tracking-widest">
                                                Enviado
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-[#FCD535]/10 text-[#FCD535] border border-[#FCD535]/20 animate-pulse tracking-widest">
                                                Pendente
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none">Motorista</p>
                                        <p className="text-sm font-bold text-gray-200 truncate">{reg.driver_name || 'N/A'}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none">Rota</p>
                                        <p className="text-sm font-bold text-gray-200 truncate">{reg.route_name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-12 text-center z-10">
                <div className="w-12 h-1 bg-white/5 mx-auto rounded-full mb-4"></div>
                <p className="text-[9px] font-black tracking-[0.4em] uppercase text-gray-600">Fim do Histórico</p>
            </div>
        </div>
    );
};

export default ReadingsHistory;
