"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Company } from '@/types/crm';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { fetchCompaniesWithStands } from '@/integrations/supabase/utils'; // Import the Supabase service

interface CrmContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  updateCrmData: (newCompanies: Company[]) => void;
  loadInitialData: () => Promise<void>; // This function will now fetch from Supabase
}

const CrmDataContext = createContext<CrmContextType | undefined>(undefined);

export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // State to hold the current user's ID

  // Effect to get the current user's ID
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadInitialData = useCallback(async () => {
    if (!userId) {
      // If no user ID, we cannot fetch user-specific data.
      // Set loading to false and show an error or empty state.
      setIsLoading(false);
      setError("Utilizador não autenticado. Por favor, faça login para ver os dados do CRM.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // Fetch companies and their stands from Supabase
      const data = await fetchCompaniesWithStands(userId);
      setCompanies(data);
      showSuccess("Dados CRM carregados com sucesso!");
    } catch (err: any) {
      console.error("Failed to load initial CRM data from Supabase:", err);
      setError(err.message || "Falha ao carregar os dados iniciais do CRM. Por favor, tente novamente.");
      showError(err.message || "Falha ao carregar os dados iniciais do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Re-run this callback if userId changes

  const updateCrmData = useCallback((newCompanies: Company[]) => {
    setCompanies(newCompanies);
    showSuccess("Dados CRM atualizados com sucesso!");
  }, []);

  // Effect to load initial data when userId becomes available or loadInitialData changes
  React.useEffect(() => {
    if (userId) {
      loadInitialData();
    }
  }, [loadInitialData, userId]);

  return (
    <CrmDataContext.Provider value={{ companies, isLoading, error, updateCrmData, loadInitialData }}>
      {children}
    </CrmDataContext.Provider>
  );
};

export const useCrmData = () => {
  const context = useContext(CrmDataContext);
  if (context === undefined) {
    throw new Error('useCrmData must be used within a CrmDataProvider');
  }
  return context;
};