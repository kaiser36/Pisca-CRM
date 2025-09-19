import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "@/components/auth/SessionContextProvider";
import React from "react";

const Index = () => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && session) {
      navigate("/crm");
    }
  }, [session, isLoading, navigate]);

  if (isLoading || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo à sua Aplicação CRM</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Comece a gerir os seus clientes do setor automóvel aqui!
        </p>
        <Link to="/login">
          <Button size="lg" className="px-8 py-4 text-lg">
            Iniciar Sessão
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;