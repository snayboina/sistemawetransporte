import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Divergence {
    id: string;
    bus_plate: string;
    bus_number: string;
    driver_name: string;
    real_driver_name: string;
    route_name: string;
    read_at: string;
    registration_id: string;
}

export default function Divergencias() {
    const [divergences, setDivergences] = useState<Divergence[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadDivergences = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('readings')
                .select('*')
                .eq('has_divergence', true)
                .order('read_at', { ascending: false });

            if (error) throw error;
            setDivergences(data || []);
        } catch (error) {
            console.error('Erro ao carregar divergências:', error);
            toast.error('Erro ao carregar divergências');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDivergences();
    }, []);

    const handleUpdateDriver = async (divergence: Divergence) => {
        if (!divergence.real_driver_name) {
            toast.error('Nome do motorista real não encontrado');
            return;
        }

        setProcessingId(divergence.id);

        try {
            // 1. Buscar o motorista real no banco
            const { data: driverData, error: driverError } = await supabase
                .from('drivers')
                .select('id')
                .ilike('name', `%${divergence.real_driver_name}%`)
                .maybeSingle();

            if (driverError) throw driverError;

            if (!driverData) {
                toast.error(`Motorista "${divergence.real_driver_name}" não encontrado no cadastro. Cadastre-o primeiro.`);
                setProcessingId(null);
                return;
            }

            // 2. Atualizar a escala (registration) com o motorista correto
            const { error: updateError } = await supabase
                .from('registrations')
                .update({ driver_id: driverData.id })
                .eq('id', divergence.registration_id);

            if (updateError) throw updateError;

            // 3. Marcar a divergência como resolvida
            const { error: readingError } = await supabase
                .from('readings')
                .update({ has_divergence: false })
                .eq('id', divergence.id);

            if (readingError) throw readingError;

            toast.success('Escala atualizada com sucesso!');
            loadDivergences();
        } catch (error) {
            console.error('Erro ao atualizar motorista:', error);
            toast.error('Erro ao atualizar escala');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando divergências...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Divergências</h1>
                    <p className="text-muted-foreground">
                        Motoristas diferentes detectados pelos fiscais
                    </p>
                </div>
                <Button onClick={loadDivergences} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {divergences.length === 0 ? (
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma divergência pendente</h3>
                        <p className="text-muted-foreground max-w-md">
                            Todas as escalas estão corretas ou não há divergências detectadas pelos fiscais.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {divergences.map((divergence) => (
                        <Card key={divergence.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-6 h-6 text-amber-500" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold">
                                                    {divergence.bus_plate} #{divergence.bus_number}
                                                </h3>
                                                <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full font-medium">
                                                    Divergência Detectada
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Rota: {divergence.route_name}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                                                    Motorista no Banco
                                                </p>
                                                <p className="font-medium text-red-600 dark:text-red-400">
                                                    {divergence.driver_name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                                                    Motorista Real (Fiscal)
                                                </p>
                                                <p className="font-medium text-green-600 dark:text-green-400">
                                                    {divergence.real_driver_name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            Detectado em {format(new Date(divergence.read_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleUpdateDriver(divergence)}
                                    disabled={processingId === divergence.id}
                                    className="ml-4"
                                >
                                    {processingId === divergence.id ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Atualizando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Atualizar Escala
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
