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

      {/* Hero Section - Centered & Typography Focused */}
      <div className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-[#FCD535]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto w-full relative z-10 text-center">

          <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#FCD535]/10 border border-[#FCD535]/20 rounded-full mb-10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-2 h-2 bg-[#FCD535] rounded-full animate-pulse shadow-[0_0_8px_#FCD535]"></div>
            <span className="text-[#FCD535] font-semibold text-sm tracking-wide uppercase">Sistema de Gestão 4.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.0] tracking-tight animate-in fade-in zoom-in duration-1000 delay-100">
            Gestão Total
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCD535] via-[#fff] to-[#FCD535] bg-300% animate-gradient">Otimizada</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Controle sua frota com precisão cirúrgica. Monitore operações, automatize
            escalas e visualize dados em tempo real.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button
              onClick={() => navigate('/app')}
              className="px-12 py-6 bg-[#FCD535] text-black rounded-2xl font-black text-xl hover:bg-[#F0B90B] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(252,213,53,0.4)]"
            >
              ACESSAR DASHBOARD
              <ArrowRight className="w-6 h-6" />
            </button>
            <button className="px-12 py-6 bg-[#1f2535] border border-gray-700 text-white rounded-2xl font-bold text-xl hover:bg-[#2a3142] transition-all backdrop-blur-md hover:border-gray-500">
              CONHECER RECURSOS
            </button>
          </div>

          {/* Floating Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            {[
              { icon: Users, text: "Controle de Passageiros", sub: "Monitoramento Ativo" },
              { icon: BarChart3, text: "Analytics em Tempo Real", sub: "Dados Precisos" },
              { icon: Shield, text: "Segurança de Dados", sub: "Criptografia Ponta a Ponta" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all hover:border-[#FCD535]/30 group cursor-default">
                <div className="w-12 h-12 bg-[#2a3142] rounded-xl flex items-center justify-center border border-gray-700 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:border-[#FCD535]">
                  <item.icon className="w-6 h-6 text-[#FCD535]" />
                </div>
                <span className="text-white font-bold text-lg mb-1">{item.text}</span>
                <span className="text-gray-500 text-sm">{item.sub}</span>
              </div>
            ))}
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
      </div >
    </div >
  );
}
