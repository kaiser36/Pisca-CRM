"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface SessionContextType {
  session: Session | null;
  isLoadingSession: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsLoadingSession(false);

      const publicRoutes = ['/', '/login']; // Rotas acessíveis sem autenticação

      if (currentSession) {
        // Se o utilizador estiver autenticado e tentar aceder à página de login, redireciona para a dashboard
        if (location.pathname === '/login') {
          navigate('/crm');
        }
      } else {
        // Se o utilizador não estiver autenticado e tentar aceder a uma rota protegida, redireciona para o login
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/login');
        }
      }
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setIsLoadingSession(false);

      const publicRoutes = ['/', '/login'];

      if (initialSession) {
        if (location.pathname === '/login') {
          navigate('/crm');
        }
      } else {
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, isLoadingSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};