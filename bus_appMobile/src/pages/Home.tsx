import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import busIllustration from '@/assets/bus-illustration.png';

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Status Bar Area */}
      <div className="w-full flex justify-between items-center p-6 pb-2 pt-12 z-10 relative">
        <div className="flex items-center gap-2 opacity-0">
          <Icon name="menu" />
        </div>
        {/* Settings Button */}
        <Link
          to="/admin"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 backdrop-blur-md border border-border text-foreground hover:bg-surface-hover transition-colors"
        >
          <Icon name="settings" size={20} />
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative px-6 justify-center">
        {/* Decorative Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-0">
          {/* Illustration Container */}
          <div className="w-full relative mb-8 flex justify-center">
            <div className="w-64 h-64 relative flex items-center justify-center">
              <img
                src={busIllustration}
                alt="Ilustração de ônibus urbano"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center text-center max-w-xs mx-auto z-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              Identifique seu ônibus
            </h1>
            <p className="text-muted-foreground text-base font-normal leading-relaxed">
              Aponte sua câmera para o código QR localizado na entrada do veículo para ver detalhes da rota.
            </p>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="w-full pb-12 pt-6 flex flex-col gap-4 z-10">
          {/* Primary Button: Scan QR */}
          <Link
            to="/scanner"
            className="btn-primary w-full"
          >
            <Icon name="qr_code_scanner" size={24} />
            <span>Ler QR Code do Ônibus</span>
          </Link>

          <Link
            to="/history"
            className="btn-outline w-full border-primary/20 bg-primary/5 text-primary"
          >
            <Icon name="history" size={24} />
            <span>Ver Leituras de Hoje</span>
          </Link>

        </div>
      </div>

      {/* Bottom Nav Indicator */}
      <div className="w-full h-5 flex justify-center items-end pb-2">
        <div className="w-32 h-1 bg-foreground/20 rounded-full" />
      </div>
    </div>
  );
};

export default Home;
