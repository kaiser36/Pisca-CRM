"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Company } from '@/types/crm';
import { parseStandsExcel, parseAdditionalCompanyInfoExcel } from '@/lib/excel-parser';
import { showSuccess, showError } from '@/utils/toast';
import { fetchCompaniesWithStands, upsertCompanies, upsertStands, updateCompanyAdditionalInfo } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';

interface CrmContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  updateCrmData: (file: File) => Promise<void>;
  updateAdditionalCompanyData: (file: File) => Promise<void>;
  loadInitialData: () => Promise<void>;
}

const CrmDataContext = createContext<CrmContextType | undefined>(undefined);

export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Monitor auth state to get the user ID
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    // Initial check for user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadInitialData = useCallback(async () => {
    if (!userId) {
      // If no user, we can't fetch user-specific data.
      // In a real app, you'd redirect to login or show a message.
      // For now, we'll just set loading to false and clear companies.
      setIsLoading(false);
      setCompanies([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCompaniesWithStands(userId);
      setCompanies(data);
      showSuccess("Dados CRM carregados com sucesso!");
    } catch (err: any) {
      console.error("Failed to load initial CRM data:", err);
      setError(`Falha ao carregar os dados iniciais do CRM: ${err.message}`);
      showError("Falha ao carregar os dados iniciais do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateCrmData = useCallback(async (file: File) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para carregar dados.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { companies: parsedCompanies, stands: parsedStands } = await parseStandsExcel(arrayBuffer);

      const companyDbIdMap = await upsertCompanies(parsedCompanies, userId);
      await upsertStands(parsedStands, companyDbIdMap);

      await loadInitialData(); // Reload all data from Supabase
      showSuccess("Dados CRM atualizados com sucesso!");
    } catch (err: any) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel:", err);
      setError(`Falha ao carregar ou analisar o ficheiro Excel: ${err.message}`);
      showError("Falha ao carregar ou analisar o ficheiro Excel. Verifique o formato.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadInitialData]);

  const updateAdditionalCompanyData = useCallback(async (file: File) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para carregar dados.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const additionalCompanies = await parseAdditionalCompanyInfoExcel(arrayBuffer);

      for (const company of additionalCompanies) {
        if (company.Company_id) {
          await updateCompanyAdditionalInfo(company.Company_id, company, userId);
        }
      }

      await loadInitialData(); // Reload all data from Supabase
      showSuccess("Informações adicionais das empresas atualizadas com sucesso!");
    } catch (err: any) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel de informações adicionais:", err);
      setError(`Falha ao carregar ou analisar o ficheiro Excel de informações adicionais: ${err.message}`);
      showError("Falha ao carregar ou analisar o ficheiro Excel de informações adicionais. Verifique o formato.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadInitialData]);

  React.useEffect(() => {
    if (userId) {
      loadInitialData();
    }
  }, [userId, loadInitialData]);

  return (
    <CrmDataContext.Provider value={{ companies, isLoading, error, updateCrmData, updateAdditionalCompanyData, loadInitialData }}>
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