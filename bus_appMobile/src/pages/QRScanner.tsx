import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import scannerBg from '@/assets/scanner-background.jpg';

const QRScanner = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Layer 1: Simulated Camera Feed */}
      <div className="absolute inset-0 z-0">
        <img 
          src={scannerBg} 
          alt="Visualização da câmera" 
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay with Blur */}
        <div className="absolute inset-0 scanner-backdrop" />
      </div>

      {/* Layer 2: UI Interface */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pt-8">
          <Link 
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-background/40 text-foreground backdrop-blur-md hover:bg-foreground/20 transition-colors duration-200"
          >
            <Icon name="close" size={24} />
          </Link>
          
          <div className="px-3 py-1 bg-background/30 rounded-full backdrop-blur-sm border border-border/30">
            <span className="text-xs font-semibold tracking-widest uppercase text-foreground/90">Scanner</span>
          </div>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-background/40 text-primary backdrop-blur-md hover:bg-primary/20 transition-colors duration-200 neon-border border border-primary/20">
            <Icon name="flash_on" size={24} filled />
          </button>
        </div>

        {/* Main Content Area: Scanner */}
        <div className="flex-1 flex flex-col items-center justify-center relative -mt-16">
          {/* Headline Text */}
          <h2 className="text-foreground text-2xl font-bold tracking-tight mb-8 text-shadow-dark text-center px-6">
            Centralize o QR Code
          </h2>

          {/* Scanner Frame */}
          <div className="relative w-72 h-72">
            {/* Scanning Laser Line */}
            <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_hsl(var(--primary))] animate-scan-vertical z-20" />

            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-l-[4px] border-t-[4px] border-primary rounded-tl-xl neon-border" />
            <div className="absolute top-0 right-0 w-12 h-12 border-r-[4px] border-t-[4px] border-primary rounded-tr-xl neon-border" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-l-[4px] border-b-[4px] border-primary rounded-bl-xl neon-border" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-r-[4px] border-b-[4px] border-primary rounded-br-xl neon-border" />

            {/* Inner Focus Area */}
            <div className="absolute inset-4 border border-foreground/10 rounded-lg" />
          </div>

          {/* Helper Text */}
          <div className="mt-8 px-4 py-2 bg-background/40 backdrop-blur-md rounded-full border border-border/30">
            <p className="text-muted-foreground text-sm font-medium leading-normal text-center">
              A leitura será automática
            </p>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-6 pb-10 w-full bg-gradient-to-t from-background/80 to-transparent">
          <div className="flex items-center justify-between gap-4">
            {/* Gallery Icon */}
            <button className="flex flex-col items-center justify-center gap-1 group">
              <div className="w-12 h-12 rounded-2xl bg-surface/80 border border-primary/30 flex items-center justify-center text-primary/80 group-hover:text-primary group-hover:border-primary group-hover:glow-primary transition-all duration-300 backdrop-blur-md">
                <Icon name="photo_library" />
              </div>
              <span className="text-[10px] font-medium text-foreground/60 group-hover:text-foreground transition-colors">Galeria</span>
            </button>

            {/* Primary Action Button */}
            <Link 
              to="/bus/ABC-1234"
              className="flex-1 h-14 bg-primary hover:brightness-110 active:scale-[0.98] rounded-full flex items-center justify-center gap-3 transition-all duration-300 glow-primary border-2 border-transparent hover:border-foreground/20"
            >
              <Icon name="keyboard" className="text-primary-foreground" />
              <span className="text-primary-foreground text-base font-bold tracking-wide">Digitar TAG do ônibus</span>
            </Link>

            {/* Help Icon */}
            <button className="flex flex-col items-center justify-center gap-1 group">
              <div className="w-12 h-12 rounded-2xl bg-surface/80 border border-primary/30 flex items-center justify-center text-primary/80 group-hover:text-primary group-hover:border-primary group-hover:glow-primary transition-all duration-300 backdrop-blur-md">
                <Icon name="help" />
              </div>
              <span className="text-[10px] font-medium text-foreground/60 group-hover:text-foreground transition-colors">Ajuda</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
