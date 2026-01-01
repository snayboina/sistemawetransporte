import { useState, useMemo } from 'react';
import { RefreshCw, Calendar, User, Bus, Filter, MapPin, Clock, Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { mockSyncReadings, mockDrivers, mockBuses } from '@/data/mockData';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Sincronizacao() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [selectedBus, setSelectedBus] = useState<string>('all');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const filteredReadings = useMemo(() => {
    return mockSyncReadings.filter((reading) => {
      // Date filter
      if (selectedDate) {
        const readingDate = reading.readAt;
        if (!isWithinInterval(readingDate, {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate),
        })) {
          return false;
        }
      }

      // Driver filter
      if (selectedDriver !== 'all' && reading.driverName !== selectedDriver) {
        return false;
      }

      // Bus filter
      if (selectedBus !== 'all' && reading.busNumber !== selectedBus) {
        return false;
      }

      return true;
    });
  }, [selectedDate, selectedDriver, selectedBus]);

  const uniqueDrivers = [...new Set(mockSyncReadings.map((r) => r.driverName))];
  const uniqueBuses = [...new Set(mockSyncReadings.map((r) => r.busNumber))];

  const clearFilters = () => {
    setSelectedDate(undefined);
    setSelectedDriver('all');
    setSelectedBus('all');
  };

  const hasActiveFilters = selectedDate || selectedDriver !== 'all' || selectedBus !== 'all';

  // Stats from filtered data
  const stats = {
    total: filteredReadings.length,
    uniqueDrivers: [...new Set(filteredReadings.map((r) => r.driverName))].length,
    uniqueBuses: [...new Set(filteredReadings.map((r) => r.busNumber))].length,
    uniqueRoutes: [...new Set(filteredReadings.map((r) => r.routeName))].length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dados de Sincronização</h1>
          <p className="text-muted-foreground mt-1">
            Visualize todas as leituras realizadas pelo app mobile
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Leituras</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <User className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.uniqueDrivers}</p>
              <p className="text-xs text-muted-foreground">Motoristas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.uniqueBuses}</p>
              <p className="text-xs text-muted-foreground">Ônibus</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">96.2%</p>
              <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Filtros</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              Limpar filtros
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-between bg-accent border-border',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  {selectedDate ? (
                    format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    'Selecione a data'
                  )}
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Driver Filter */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Motorista
            </label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="bg-accent border-border">
                <SelectValue placeholder="Todos os motoristas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os motoristas</SelectItem>
                {uniqueDrivers.map((driver) => (
                  <SelectItem key={driver} value={driver}>
                    {driver}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bus Filter */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Bus className="w-4 h-4" />
              Ônibus
            </label>
            <Select value={selectedBus} onValueChange={setSelectedBus}>
              <SelectTrigger className="bg-accent border-border">
                <SelectValue placeholder="Todos os ônibus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os ônibus</SelectItem>
                {uniqueBuses.map((bus) => (
                  <SelectItem key={bus} value={bus}>
                    {bus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Leituras Registradas</h2>
            <span className="text-sm text-muted-foreground">
              {filteredReadings.length} resultado{filteredReadings.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/50">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Data/Hora
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Motorista
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4" />
                    Ônibus
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Placa</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rota</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Local da Leitura
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.length > 0 ? (
                filteredReadings.map((reading, index) => (
                  <tr
                    key={reading.id}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {format(reading.readAt, 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(reading.readAt, 'HH:mm:ss', { locale: ptBR })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground">{reading.driverName}</td>
                    <td className="py-3 px-4 text-foreground">{reading.busNumber}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-xs">
                        {reading.busPlate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-foreground max-w-[200px] truncate">
                      {reading.routeName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-foreground">{reading.readingLocation}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-10 h-10 text-muted-foreground/50" />
                      <p>Nenhuma leitura encontrada</p>
                      <p className="text-sm">Tente ajustar os filtros</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
