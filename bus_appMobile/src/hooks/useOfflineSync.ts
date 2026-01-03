import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PendingReading {
    id: string;
    registration_id: string | null;
    driver_name: string;
    bus_number: string;
    bus_plate: string;
    route_name: string;
    location: string;
    reading_location: string;
    read_at: string;
    has_divergence?: boolean;
    real_driver_name?: string | null;
}

const STORAGE_KEY = 'swiftride_pending_readings';

export const useOfflineSync = () => {
    const { toast } = useToast();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);

    const [registrationsList, setRegistrationsList] = useState<any[]>([]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load cached data immediately
        loadCachedCatalogs();
        updatePendingCount();

        if (isOnline) {
            syncData();
            syncCatalogs();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isOnline]);

    const loadCachedCatalogs = () => {
        try {
            const cached = localStorage.getItem('swiftride_catalog_registrations');
            if (cached) {
                setRegistrationsList(JSON.parse(cached));
            }
        } catch (e) {
            console.error('Error loading cached catalogs:', e);
        }
    };

    const syncCatalogs = async () => {
        if (!navigator.onLine) return;

        try {
            console.log('Syncing catalogs...');
            const { data, error } = await supabase
                .from('registrations')
                .select('*, drivers(name), buses(bus_number, plate), routes(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setRegistrationsList(data);
                localStorage.setItem('swiftride_catalog_registrations', JSON.stringify(data));
                console.log('Catalogs synced:', data.length, 'records');
            }
        } catch (err) {
            console.error('Error syncing catalogs:', err);
        }
    };

    const updatePendingCount = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            setPendingCount(data.length);
        } else {
            setPendingCount(0);
        }
    };


    const saveReading = async (reading: Omit<PendingReading, 'id'>) => {
        const newReading = {
            ...reading,
            id: crypto.randomUUID(),
            read_at: new Date().toISOString()
        };

        if (isOnline) {
            try {
                const { error } = await supabase.from('readings').insert([newReading]);
                if (error) {
                    console.error('Supabase insert error:', error);
                    throw error;
                }
                toast({ title: 'Leitura enviada!', description: 'Sincronizado com sucesso.' });
                // Refresh catalogs after successful read might be good to ensure we have latest, 
                // but maybe overkill for every read. Keeping it simple.
            } catch (err: any) {
                console.error('Error syncing reading:', err);
                console.log('=== ERRO DE SINCRONIZAÇÃO ===');
                console.log('Mensagem:', err?.message || 'Sem mensagem');
                console.log('Código:', err?.code || 'Sem código');
                console.log('Detalhes:', err?.details || 'Sem detalhes');
                console.log('Hint:', err?.hint || 'Sem hint');
                console.log('=============================');

                const errorMsg = err?.message || err?.error_description || 'Erro desconhecido';
                toast({
                    title: 'Erro na sincronização',
                    description: `Falha ao enviar: ${errorMsg}. Salvo localmente.`,
                    variant: 'destructive',
                    duration: 5000
                });
                storeLocally(newReading);
            }
        } else {
            storeLocally(newReading);
        }
    };


    const storeLocally = (reading: PendingReading) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : [];
        data.push(reading);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        updatePendingCount();
        toast({
            title: 'Modo Offline',
            description: 'Leitura salva localmente. Será sincronizada automaticamente.',
            variant: 'default'
        });
    };

    const syncData = async () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const data: PendingReading[] = JSON.parse(stored);
        if (data.length === 0) return;

        toast({ title: 'Sincronizando...', description: `Enviando ${data.length} leituras pendentes.` });

        try {
            const { error } = await supabase.from('readings').insert(data);
            if (error) throw error;

            localStorage.removeItem(STORAGE_KEY);
            setPendingCount(0);
            toast({ title: 'Sincronização concluída!', description: 'Todos os dados foram enviados.' });
        } catch (err: any) {
            console.error('Sync failed:', err);
            toast({
                title: 'Falha na sincronização',
                description: err?.message || 'Erro desconhecido ao enviar dados.',
                variant: 'destructive'
            });
        }
    };

    const getDailyReadings = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let remoteReadings: PendingReading[] = [];
        try {
            const { data, error } = await supabase
                .from('readings')
                .select('*')
                .gte('read_at', today.toISOString())
                .order('read_at', { ascending: false });

            if (error) throw error;
            remoteReadings = data || [];
        } catch (err) {
            console.error('Error fetching today\'s readings:', err);
        }

        // Recuperar leituras locais pendentes
        const stored = localStorage.getItem(STORAGE_KEY);
        const localReadings: PendingReading[] = stored ? JSON.parse(stored) : [];

        // Filtrar apenas o que é de hoje (opcional, mas bom por segurança)
        const todayStr = today.toISOString().split('T')[0];
        const pendingToday = localReadings.filter(r => r.read_at.startsWith(todayStr));

        // Mesclar e ordenar por data decrescente
        const allReadings = [
            ...pendingToday.map(r => ({ ...r, status: 'pending' })),
            ...remoteReadings.map(r => ({ ...r, status: 'synced' }))
        ].sort((a, b) => new Date(b.read_at).getTime() - new Date(a.read_at).getTime());

        return allReadings;
    };

    return { isOnline, pendingCount, saveReading, syncData, getDailyReadings, registrationsList, syncCatalogs };
};

