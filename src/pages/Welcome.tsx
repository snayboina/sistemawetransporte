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
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <div className="relative z-10 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
                <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></span>
                Sistema em Tempo Real
              </div>

              <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                Gestão Total
                <br />
                <span className="text-[#FCD535]">Otimizada</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-lg">
                A plataforma SaaS definitiva para monitoramento de frotas,
                controle de passageiros e segurança veicular. Dados precisos
                para decisões estratégicas.
              </p>

              {/* Feature Cards Mini */}
              <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-xl">
                {[
                  { icon: Users, label: "Controle de Passageiros" },
                  { icon: BarChart3, label: "Analytics Tempo Real" },
                  { icon: Shield, label: "Segurança de Dados" },
                ].map((feature, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <feature.icon className="w-6 h-6 text-[#FCD535] mb-3" />
                    <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
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
                <button className="px-8 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Explorar Demo
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700"></div>
                  ))}
                </div>
                <span>+2.000 gestores confiam.</span>
              </div>
            </div>

            {/* Right Image/Mockup */}
            <div className="relative z-10 animate-in fade-in slide-in-from-right duration-700 delay-200 flex justify-center items-center">
              <div className="relative w-full max-w-2xl transform scale-110 md:scale-125 transition-transform duration-700 hover:scale-[1.3]">
                <img
                  src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1767289139/Gemini_Generated_Image_zaf06jzaf06jzaf0_pjyox1.png"
                  alt="App Dashboard Preview"
                  className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Decorative blobs */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-tr from-blue-100 to-[#FCD535]/30 dark:from-blue-900/20 dark:to-[#FCD535]/20 blur-[120px] rounded-full opacity-60 pointer-events-none"></div>
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
