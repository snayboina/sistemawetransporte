import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Bus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
          <Bus className="w-10 h-10 text-primary" />
        </div>
        <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Página não encontrada</p>
        <Button onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
