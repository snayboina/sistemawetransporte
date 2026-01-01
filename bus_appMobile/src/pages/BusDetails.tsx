import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';

interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, subValue }) => (
  <div className="card-surface flex items-start gap-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon name={icon} size={20} />
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-medium uppercase tracking-wider text-label">{label}</span>
      <span className="mt-0.5 text-base font-semibold text-foreground">{value}</span>
      {subValue && <span className="text-sm font-normal text-muted-foreground">{subValue}</span>}
    </div>
  </div>
);

const BusDetails = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background/80 px-4 py-4 backdrop-blur-md">
        <Link 
          to="/"
          className="group flex size-10 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 active:bg-foreground/20"
        >
          <Icon name="arrow_back_ios_new" size={24} />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight text-foreground">Detalhes do Ônibus</h1>
        <div className="size-10" />
      </header>

      <main className="flex flex-col gap-6 px-4 pt-2">
        {/* Hero Card: Vehicle Identity */}
        <div className="relative overflow-hidden rounded-xl bg-card p-6 shadow-lg ring-1 ring-border">
          {/* Decorative gradient glow */}
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
          
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-inset ring-success/20">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                Ativo
              </span>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">ABC-1234</h2>
              <p className="text-base font-medium text-muted-foreground">Ônibus Urbano</p>
            </div>
            
            {/* Vehicle Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-foreground/5 ring-1 ring-border">
              <Icon name="directions_bus" size={36} className="text-muted-foreground" />
            </div>
          </div>

          {/* Separator */}
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon name="verified_user" size={16} />
              <span>Veículo verificado e seguro</span>
            </div>
          </div>
        </div>

        {/* Detailed Grid Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard icon="sell" label="TAG" value="987654321" />
          <InfoCard icon="event_available" label="Mobilização" value="12/05/2023" />
          <InfoCard icon="local_shipping" label="Marca / Modelo" value="Mercedes-Benz" subValue="OF-1721" />
          <InfoCard icon="badge" label="Subcontrato" value="Transportes Silva" />
        </div>

        {/* System Status Section */}
        <div className="rounded-xl bg-card p-4 ring-1 ring-border">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-semibold text-foreground">Status do Sistema</h3>
            <span className="text-xs text-primary">Online</span>
          </div>
          <div className="flex gap-2">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-foreground/20" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Última sincronização há 2 minutos. Todos os sensores operacionais.
          </p>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 p-4 pb-8 backdrop-blur-xl">
        <Link 
          to="/scanner"
          className="btn-primary w-full"
        >
          <Icon name="qr_code_scanner" size={22} />
          <span>Nova Leitura</span>
        </Link>
      </div>
    </div>
  );
};

export default BusDetails;
