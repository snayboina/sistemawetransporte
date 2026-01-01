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
      <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#FCD535]/10 blur-3xl rounded-full"></div>
              <div className="relative z-10 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                <img
                  src="/hero-image.png"
                  alt="SwiftRide Dashboard"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Right Column - Information */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCD535]/10 border border-[#FCD535]/30 rounded-full mb-6">
                <div className="w-2 h-2 bg-[#FCD535] rounded-full animate-pulse"></div>
                <span className="text-[#FCD535] font-semibold text-sm">Sistema em tempo real</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Gestão Inteligente
                <br />
                <span className="text-[#FCD535]">de Frotas</span>
              </h1>

              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Controle completo da sua frota de ônibus com tecnologia de ponta.
                Monitore, analise e otimize suas operações em tempo real com nossa plataforma intuitiva.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2a3142] rounded-lg flex items-center justify-center border border-gray-800">
                    <Users className="w-5 h-5 text-[#FCD535]" />
                  </div>
                  <span className="text-gray-300">Gestão de passageiros em tempo real</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2a3142] rounded-lg flex items-center justify-center border border-gray-800">
                    <BarChart3 className="w-5 h-5 text-[#FCD535]" />
                  </div>
                  <span className="text-gray-300">Análises e relatórios detalhados</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2a3142] rounded-lg flex items-center justify-center border border-gray-800">
                    <Shield className="w-5 h-5 text-[#FCD535]" />
                  </div>
                  <span className="text-gray-300">Monitoramento 24/7 com segurança total</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/app')}
                  className="px-8 py-4 bg-[#FCD535] text-black rounded-lg font-bold text-lg hover:bg-[#F0B90B] transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-[#FCD535]/20"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-[#2a3142] border-2 border-gray-700 text-white rounded-lg font-bold text-lg hover:bg-[#343b4f] transition-all">
                  Saiba Mais
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-800">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Por que escolher o SmartBus?</h2>
          <p className="text-xl text-gray-400">Recursos poderosos para otimizar sua operação</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#252b3b] backdrop-blur-lg rounded-2xl p-8 border border-gray-800 hover:border-[#FCD535]/50 transition-all">
            <div className="w-12 h-12 bg-[#FCD535]/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#FCD535]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Gestão de Passageiros</h3>
            <p className="text-gray-400">
              Acompanhe o fluxo de passageiros e otimize rotas com dados em tempo real.
            </p>
          </div>
          <div className="bg-[#252b3b] backdrop-blur-lg rounded-2xl p-8 border border-gray-800 hover:border-[#FCD535]/50 transition-all">
            <div className="w-12 h-12 bg-[#FCD535]/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-[#FCD535]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Análises Avançadas</h3>
            <p className="text-gray-400">
              Relatórios detalhados e insights para tomada de decisões estratégicas.
            </p>
          </div>
          <div className="bg-[#252b3b] backdrop-blur-lg rounded-2xl p-8 border border-gray-800 hover:border-[#FCD535]/50 transition-all">
            <div className="w-12 h-12 bg-[#FCD535]/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#FCD535]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Segurança Total</h3>
            <p className="text-gray-400">
              Monitoramento 24/7 e alertas instantâneos para máxima segurança.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
