import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#1a1f2e] flex flex-col overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FCD535]/10 blur-[130px] rounded-full"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 blur-[130px] rounded-full"></div>

      {/* Top Bar Area */}
      <div className="w-full flex justify-between items-center p-6 pt-12 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-md">
            <Icon name="commute" className="text-[#FCD535]" size={20} />
          </div>
          <div>
            <div className="text-white font-black text-sm tracking-tighter">SmartBus</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mobile VIP</div>
          </div>
        </div>

        <Link
          to="/admin"
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg"
        >
          <Icon name="settings" size={20} />
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative px-8 justify-center z-10">

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center mb-12">
          {/* Illustration Container with Glow */}
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-[#FCD535]/20 blur-[60px] rounded-full animate-pulse"></div>
            <div className="w-64 h-64 relative flex items-center justify-center animate-float">
              <img
                src="/favicon.png"
                alt="SmartBus Logo"
                className="w-48 h-48 object-cover rounded-[3rem] shadow-2xl filter drop-shadow-[0_20px_40px_rgba(252,213,53,0.3)]"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-black tracking-tighter text-white mb-4 leading-none">
              Controle Total <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCD535] to-[#F0B90B]">na palma da mão</span>
            </h1>
            <p className="text-gray-400 text-base font-medium leading-relaxed max-w-[280px]">
              Escanear, monitorar e registrar sua frota nunca foi tão rápido e elegante.
            </p>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="w-full flex flex-col gap-4">
          <Link
            to="/scanner"
            className="group relative w-full py-5 bg-[#FCD535] text-black rounded-[2rem] font-black text-lg shadow-[0_25px_50px_-12px_rgba(252,213,53,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95 hover:scale-[1.02]"
          >
            <Icon name="qr_code_scanner" size={24} />
            <span>INICIAR LEITURA</span>
            <div className="absolute inset-0 rounded-[2rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          <Link
            to="/history"
            className="w-full py-5 bg-[#252b3b] text-white rounded-[2rem] border border-white/10 font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 backdrop-blur-md"
          >
            <Icon name="history" size={24} />
            <span>HISTÓRICO</span>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-8 pb-10 text-center z-10">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
          Powered by SmartBus Technology
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
