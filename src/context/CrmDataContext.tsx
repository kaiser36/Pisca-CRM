"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Company } from '@/types/crm';
import { showError } from '@/utils/toast';
import { useSession } from '@/components/auth/SessionContextProvider'; // Import useSession
import { fetchCompaniesWithStands } from '@/integrations/supabase/utils'; // Import fetchCompaniesWithStands

interface CrmContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  updateCrmData: (newCompanies: Company[]) => void;
  loadInitialData: () => Promise<void>;
}

const CrmDataContext = createContext<CrmContextType | undefined>(undefined);

export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoadingSession } = useSession(); // Get session and loading state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    if (isLoadingSession) return; // Wait for session to load

    if (!session?.user?.id) {
      // If no user is logged in, clear data and stop loading
      setCompanies([]);
      setIsLoading(false);
      setError("Nenhum utilizador autenticado. Por favor, faça login para ver os dados do CRM.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCompaniesWithStands(session.user.id); // Fetch data for the current user
      setCompanies(data);
      // showSuccess("Dados CRM carregados com sucesso!"); // Removed to avoid excessive toasts on initial load
    } catch (err: any) {
      console.error("Failed to load CRM data from Supabase:", err);
      setError(`Falha ao carregar os dados do CRM: ${err.message}`);
      showError("Falha ao carregar os dados do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, isLoadingSession]); // Depend on session.user.id and isLoadingSession

  const updateCrmData = useCallback((newCompanies: Company[]) => {
    setCompanies(newCompanies);
    // showSuccess("Dados CRM atualizados com sucesso!"); // Removed to avoid excessive toasts
  }, []);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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