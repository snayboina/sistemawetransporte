import { useNavigate } from "react-router-dom";
import { Bus, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1f2e]">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#FCD535]/10 border border-[#FCD535]/30 mb-6">
          <Bus className="w-10 h-10 text-[#FCD535]" />
        </div>
        <h1 className="mb-2 text-6xl font-bold text-white">404</h1>
        <p className="mb-6 text-xl text-gray-400">Página não encontrada</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-[#FCD535] text-black rounded-lg font-semibold hover:bg-[#F0B90B] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </button>
      </div>
    </div>
  );
};

export default NotFound;
