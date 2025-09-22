"use client";

import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "@/components/auth/SessionContextProvider"; // Import useSession
import React, { useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const { session, isLoadingSession } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingSession && session) {
      navigate("/crm"); // Redirect to CRM if logged in
    } else if (!isLoadingSession && !session) {
      // Optionally, you could redirect to login here, but the SessionContextProvider already handles it for protected routes.
      // For the root, we'll just show the welcome message and login button.
    }
  }, [session, isLoadingSession, navigate]);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>A carregar sessão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo à sua Aplicação CRM</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Faça login para começar a gerir os seus clientes do setor automóvel!
        </p>
        <Link to="/login">
          <Button size="lg" className="px-8 py-4 text-lg">
            Fazer Login
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;