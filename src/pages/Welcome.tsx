import { useNavigate } from 'react-router-dom';
import { Bus, Users, BarChart3, Shield, ArrowRight } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6 bg-[#252b3b]/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCD535] rounded-lg flex items-center justify-center">
              <Bus className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">SmartBus</div>
              <div className="text-xs text-gray-400">Francis Developer</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="px-6 py-2 bg-[#FCD535] text-black rounded-lg font-semibold hover:bg-[#F0B90B] transition-colors"
          >
            Acessar Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section - Two Columns */}
      <div className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FCD535]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left Column - Information */}
            <div className="text-left order-2 md:order-1 animate-in fade-in slide-in-from-left duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCD535]/10 border border-[#FCD535]/20 rounded-full mb-8 backdrop-blur-md">
                <div className="w-2 h-2 bg-[#FCD535] rounded-full animate-pulse shadow-[0_0_8px_#FCD535]"></div>
                <span className="text-[#FCD535] font-medium text-sm tracking-wide uppercase">Sistema em tempo real</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
                Gestão Total
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCD535] to-[#F0B90B]">Otimizada</span>
              </h1>

              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl">
                Controle sua frota com precisão cirúrgica. Monitore operações, automatize
                escalas e visualize dados em tempo real com nossa interface de alta performance.
              </p>

              {/* Features List with Glassmorphism */}
              <div className="grid gap-4 mb-10">
                {[
                  { icon: Users, text: "Controle de Passageiros" },
                  { icon: BarChart3, text: "Analytics em Tempo Real" },
                  { icon: Shield, text: "Segurança de Dados ponta a ponta" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                    <div className="w-10 h-10 bg-[#2a3142] rounded-lg flex items-center justify-center border border-gray-700 group-hover:border-[#FCD535]/50 transition-colors">
                      <item.icon className="w-5 h-5 text-[#FCD535]" />
                    </div>
                    <span className="text-gray-300 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-5">
                <button
                  onClick={() => navigate('/app')}
                  className="px-10 py-5 bg-[#FCD535] text-black rounded-2xl font-black text-lg hover:bg-[#F0B90B] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 shadow-[0_20px_40px_-15px_rgba(252,213,53,0.3)]"
                >
                  ACESSAR AGORA
                  <ArrowRight className="w-6 h-6" />
                </button>
                <button className="px-10 py-5 bg-[#1f2535] border border-gray-700 text-white rounded-2xl font-bold text-lg hover:bg-[#2a3142] transition-all backdrop-blur-md">
                  EXPLORAR
                </button>
              </div>
            </div>

            {/* Right Column - Image with Glow and 3D Perspective */}
            <div className="relative order-1 md:order-2 animate-in fade-in zoom-in duration-1000 delay-200 perspective-[2000px] flex justify-center py-10 md:py-20">
              <div className="absolute -inset-20 bg-gradient-to-tr from-[#FCD535]/20 to-blue-500/10 blur-[120px] rounded-full opacity-40"></div>

              <div className="relative transform-gpu transition-all duration-1000 hover:scale-105"
                style={{ transform: 'rotateX(25deg) rotateY(-10deg) rotateZ(-5deg)' }}>
                <div className="relative rounded-[3rem] overflow-hidden border border-white/20 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.8)] bg-[#1a1f2e]">
                  <img
                    src="https://res.cloudinary.com/duyb5dsw0/image/upload/v1767289139/Gemini_Generated_Image_zaf06jzaf06jzaf0_pjyox1.png"
                    alt="SwiftRide Premium View"
                    className="w-full h-auto min-w-[600px] md:min-w-[900px] max-w-none transform scale-110"
                  />
                  {/* Subtle overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none"></div>
                </div>

                {/* Visual shadow on the 'floor' */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[110%] h-32 bg-black/70 blur-[70px] -z-10 rounded-full"></div>
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-10 left-0 bg-[#252b3b]/95 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-3xl hidden lg:block animate-bounce-slow z-30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FCD535] rounded-full flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(252,213,53,0.4)]">
                    99%
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-lg">uptime</div>
                    <div className="text-sm text-gray-400 font-medium">Operação 24/7 Ativa</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Inovação em cada detalhe</h2>
          <div className="w-24 h-1 bg-[#FCD535] mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: Users,
              title: "Gestão de Passageiros",
              desc: "Acompanhe o fluxo em tempo real com mapas interativos e dados precisos."
            },
            {
              icon: BarChart3,
              title: "Performance Analytics",
              desc: "Relatórios automatizados que transformam dados complexos em decisões simples."
            },
            {
              icon: Shield,
              title: "Segurança Avançada",
              desc: "Monitoramento constante com alertas criptografados e proteção de frota."
            }
          ].map((feature, idx) => (
            <div key={idx} className="group bg-gradient-to-b from-[#252b3b] to-[#1a1f2e] p-10 rounded-[2rem] border border-white/5 hover:border-[#FCD535]/30 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-[#FCD535]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#FCD535] transition-all duration-500">
                <feature.icon className="w-8 h-8 text-[#FCD535] group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
