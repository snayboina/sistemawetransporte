import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NotificationBell() {
    const [divergenceCount, setDivergenceCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Buscar contagem inicial de divergências ativas
        const fetchInitialCount = async () => {
            const { count, error } = await supabase
                .from('readings')
                .select('*', { count: 'exact', head: true })
                .eq('has_divergence', true);

            if (!error && count !== null) {
                setDivergenceCount(count);
            }
        };

        fetchInitialCount();

        // 2. Inscrever para mudanças em tempo real na tabela 'readings'
        const channel = supabase
            .channel('divergence_alerts')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'readings',
                },
                (payload) => {
                    // Se for uma nova inserção com divergência
                    if (payload.eventType === 'INSERT' && payload.new.has_divergence) {
                        setDivergenceCount(prev => prev + 1);
                        toast.error('Nova divergência detectada!', {
                            description: `Ônibus ${payload.new.bus_plate} com motorista não escalado.`,
                            action: {
                                label: 'Ver',
                                onClick: () => navigate('/divergencias')
                            }
                        });

                        // Audio feedback opcional pode ser adicionado aqui
                    }

                    // Se uma divergência for resolvida (has_divergence mudou para false)
                    if (payload.eventType === 'UPDATE') {
                        if (payload.old.has_divergence && !payload.new.has_divergence) {
                            setDivergenceCount(prev => Math.max(0, prev - 1));
                        } else if (!payload.old.has_divergence && payload.new.has_divergence) {
                            setDivergenceCount(prev => prev + 1);
                        }
                    }

                    // Se um registro for deletado
                    if (payload.eventType === 'DELETE' && payload.old.has_divergence) {
                        setDivergenceCount(prev => Math.max(0, prev - 1));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [navigate]);

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "relative text-muted-foreground hover:text-foreground transition-all duration-300",
                divergenceCount > 0 && "text-amber-500 hover:text-amber-600"
            )}
            onClick={() => navigate('/divergencias')}
        >
            <Bell className={cn(
                "w-5 h-5",
                divergenceCount > 0 && "animate-tada" // Usaremos uma animação customizada ou pulse
            )} />

            {divergenceCount > 0 && (
                <>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
                            {divergenceCount}
                        </span>
                    </span>
                </>
            )}
        </Button>
    );
}
