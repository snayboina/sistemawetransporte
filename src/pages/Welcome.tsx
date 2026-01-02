import { useNavigate } from 'react-router-dom';
import { Bus, ArrowRight, Shield, BarChart3, Users, Moon, Sun, PlayCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCD535] rounded-xl flex items-center justify-center shadow-lg shadow-[#FCD535]/20">
              <Bus className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white leading-none">SmartBus</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">FRANCIS DEVELOPER</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Funcionalidades', 'Soluções', 'Planos'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#FCD535] transition-colors">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/app')}
              className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              Acessar Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden bg-[#020817]">
        {/* Background Gradient Spot */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <div className="relative z-10 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-800/50 border border-gray-700 rounded-full text-xs font-bold text-[#FCD535] uppercase tracking-wider mb-8">
                <span className="w-2 h-2 bg-[#FCD535] rounded-full animate-pulse shadow-[0_0_8px_#FCD535]"></span>
                Sistema em Tempo Real
              </div>

              <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                Gestão Total
                <br />
                <span className="text-[#FCD535]">Otimizada</span>
              </h1>

              <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">
                A plataforma SaaS definitiva para monitoramento de frotas,
                controle de passageiros e segurança veicular. Dados precisos
                para decisões estratégicas.
              </p>

              {/* Feature Cards Mini - Dark Styled */}
              <div className="grid grid-cols-2 gap-4 mb-10 w-full max-w-md">
                {[
                  { icon: Users, label: "Controle de Passageiros" },
                  { icon: BarChart3, label: "Analytics Tempo Real" },
                  { icon: Shield, label: "Segurança de Dados" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-[#0F172A] border border-gray-800 rounded-xl hover:border-[#FCD535]/50 transition-colors group">
                    <feature.icon className="w-5 h-5 text-[#FCD535]" />
                    <div className="text-sm font-semibold text-gray-200">
                      {feature.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 items-center mb-12">
                <button
                  onClick={() => navigate('/app')}
                  className="px-8 py-4 bg-[#FCD535] text-black rounded-xl font-bold text-lg hover:bg-[#F0B90B] transition-all transform hover:-translate-y-1 shadow-[0_10px_20px_-5px_rgba(252,213,53,0.3)] flex items-center gap-2"
                >
                  Acessar Agora
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-transparent border border-gray-700 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-all flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Explorar Demo
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                <div className="flex -space-x-3">
                  {['A', 'B', 'C', 'D'].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020817] bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                      {i}
                    </div>
                  ))}
                </div>
                <span>+2.000 gestores confiam.</span>
              </div>
            </div>

            {/* Right Image/Mockup */}
            <div className="relative z-10 animate-in fade-in slide-in-from-right duration-700 delay-200 flex justify-center items-center">
              <div className="relative w-full max-w-2xl transform transition-transform duration-700 hover:scale-[1.02]">
                {/* Custom Mockup Image from User */}
                <img
                  src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1767289139/Gemini_Generated_Image_zaf06jzaf06jzaf0_pjyox1.png"
                  alt="App Dashboard Preview"
                  className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl border border-gray-800/50"
                />

                {/* Floating Overlay Card Example (Optional - based on image visual) */}
                <div className="absolute bottom-10 left-[-20px] bg-[#1a1f2e]/90 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-2xl animate-in slide-in-from-bottom-4 duration-1000 delay-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FCD535]/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-[#FCD535]" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">98.5%</div>
                      <div className="text-xs text-gray-400">Uptime garantido</div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-10 right-[-10px] bg-[#1a1f2e]/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700 shadow-xl animate-in slide-in-from-top-4 duration-1000 delay-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-white">5 veículos online</span>
                  </div>
                </div>

              </div>

              {/* Decorative Glow */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FCD535]/5 blur-[150px] rounded-full pointer-events-none"></div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Logostrip */}
      <div className="py-10 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 flex justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Simple Text Placeholders for Logos */}
          <span className="text-xl font-black text-gray-400">TransLog</span>
          <span className="text-xl font-black text-gray-400">CityMove</span>
          <span className="text-xl font-black text-gray-400">GeoFleet</span>
          <span className="text-xl font-black text-gray-400">SecureBus</span>
        </div>
      </div>

    </div>
  );
}
