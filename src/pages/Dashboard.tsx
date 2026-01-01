import { Bus, Users, QrCode, MapPin, TrendingUp, Clock, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { mockDashboardStats, mockSyncReadings } from '@/data/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const recentReadings = mockSyncReadings.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral da operação em tempo real</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/20">
          <Activity className="w-4 h-4 text-success animate-pulse" />
          <span className="text-sm font-medium text-success">Sistema Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ônibus Ativos"
          value={mockDashboardStats.activeBuses}
          icon={Bus}
          trend={{ value: 3.2, isPositive: true }}
        />
        <StatsCard
          title="Motoristas Ativos"
          value={mockDashboardStats.activeDrivers}
          icon={Users}
          trend={{ value: 1.5, isPositive: true }}
        />
        <StatsCard
          title="Leituras Hoje"
          value={mockDashboardStats.todayReadings}
          icon={QrCode}
          trend={{ value: 12.8, isPositive: true }}
        />
        <StatsCard
          title="Rotas em Operação"
          value={`${mockDashboardStats.activeRoutes}/32`}
          icon={MapPin}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Atividade Recente</h2>
            </div>
            <span className="text-xs text-muted-foreground">Últimas 5 leituras</span>
          </div>
          <div className="space-y-3">
            {recentReadings.map((reading, index) => (
              <div
                key={reading.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {reading.driverName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {reading.busNumber} • {reading.readingLocation}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-foreground">
                    {format(reading.readAt, 'HH:mm', { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(reading.readAt, 'dd/MM', { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Desempenho</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Operação</span>
                <span className="font-medium text-foreground">96.2%</span>
              </div>
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: '96.2%' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Leituras por Hora</span>
                <span className="font-medium text-foreground">118</span>
              </div>
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all duration-1000"
                  style={{ width: '78%' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cobertura de Rotas</span>
                <span className="font-medium text-foreground">87.5%</span>
              </div>
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: '87.5%' }}
                />
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-success/10">
                <p className="text-lg font-bold text-success">89</p>
                <p className="text-xs text-muted-foreground">Em Rota</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <p className="text-lg font-bold text-primary">42</p>
                <p className="text-xs text-muted-foreground">Parados</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <p className="text-lg font-bold text-destructive">11</p>
                <p className="text-xs text-muted-foreground">Manutenção</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
