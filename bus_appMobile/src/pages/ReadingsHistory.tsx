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
        <div className="min-h-screen bg-black flex flex-col text-white">
            <div className="pt-12 border-b border-white/10 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="p-6 flex items-center justify-between pb-4">
                    <Link to="/" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Icon name="arrow_back" size={24} />
                    </Link>
                    <h1 className="text-xl font-bold">Leituras de Hoje</h1>
                    {isOnline && readings.some(r => r.status === 'pending') ? (
                        <button
                            onClick={handleSync}
                            className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-pulse"
                            title="Sincronizar agora"
                        >
                            <Icon name="sync" size={20} />
                        </button>
                    ) : (
                        <div className="w-10" />
                    )}
                </div>

                {/* Search Bar */}
                <div className="px-6 pb-4">
                    <div className="relative">
                        <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar motorista ou placa..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4">
                {!isOnline && (
                    <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl mb-6 flex items-center gap-3">
                        <Icon name="cloud_off" className="text-red-400" />
                        <p className="text-xs text-red-200">Você está offline. Algumas leituras podem não aparecer até sincronizar.</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Carregando histórico...</p>
                    </div>
                ) : filteredReadings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 text-center opacity-40">
                        <Icon name="history" size={64} className="mb-4" />
                        <p className="text-lg font-medium">
                            {searchTerm ? "Nenhum resultado encontrado" : "Nenhuma leitura encontrada"}
                        </p>
                        <p className="text-sm">
                            {searchTerm ? "Tente buscar por outro termo." : "As leituras realizadas hoje aparecerão aqui."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReadings.map((reg) => (
                            <div key={reg.id} className="bg-gray-900 border border-white/5 p-4 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-primary font-black text-lg">{reg.bus_plate}</p>
                                            {reg.bus_number && (
                                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">#{reg.bus_number}</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{reg.registration_id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400">
                                            {format(new Date(reg.read_at), "HH:mm", { locale: ptBR })}
                                        </p>
                                        {reg.status === 'synced' ? (
                                            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                                Sincronizado
                                            </span>
                                        ) : (
                                            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse">
                                                Pendente
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2 py-2 border-t border-white/5">
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase font-bold">Motorista</p>
                                        <p className="text-sm truncate">{reg.driver_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase font-bold">Rota</p>
                                        <p className="text-sm truncate">{reg.route_name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-10 text-center opacity-20">
                <p className="text-[10px] font-bold tracking-widest uppercase">Fim do Histórico</p>
            </div>
        </div>
    );
};

export default ReadingsHistory;
