import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PendingReading {
    id: string;
    registration_id: string;
    driver_name: string;
    bus_number: string;
    bus_plate: string;
    route_name: string;
    location: string;
    reading_location: string;
    read_at: string;
}

const STORAGE_KEY = 'swiftride_pending_readings';

export const useOfflineSync = () => {
    const { toast } = useToast();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        updatePendingCount();

        if (isOnline) {
            syncData();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isOnline]);

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
                const { error } = await supabase.from('sync_readings').insert([newReading]);
                if (error) throw error;
                toast({ title: 'Leitura enviada!', description: 'Sincronizado com sucesso.' });
            } catch (err) {
                console.error('Error syncing reading:', err);
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
            const { error } = await supabase.from('sync_readings').insert(data);
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

        try {
            const { data, error } = await supabase
                .from('sync_readings')
                .select('*')
                .gte('read_at', today.toISOString())
                .order('read_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error fetching today\'s readings:', err);
            return [];
        }
    };

    return { isOnline, pendingCount, saveReading, syncData, getDailyReadings };
};
