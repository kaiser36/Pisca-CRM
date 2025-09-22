"use client";

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Company } from '@/types/crm';
import { parseStandsExcel } from '@/lib/excel-parser';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchCompaniesWithStands, fetchGenericExcelData } from '@/integrations/supabase/utils';

interface CrmContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  updateCrmData: (newCompanies: Company[]) => void;
  loadInitialData: () => Promise<void>;
}

const CrmDataContext = createContext<CrmContextType | undefined>(undefined);

// Helper to merge generic Excel data into company objects
const mergeGenericDataIntoCompanies = (
  companies: Company[],
  genericData: { file_name: string; row_data: Record<string, any>; company_id_from_excel: string }[]
): Company[] => {
  const companiesMap = new Map<string, Company>(companies.map(c => [c.Company_id, { ...c, genericExcelData: [] }]));

  genericData.forEach(genericItem => {
    const company = companiesMap.get(genericItem.company_id_from_excel);
    if (company) {
      if (!company.genericExcelData) {
        company.genericExcelData = [];
      }
      company.genericExcelData.push({
        file_name: genericItem.file_name,
        row_data: genericItem.row_data,
      });
    }
  });

  return Array.from(companiesMap.values());
};

export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, 'User ID:', session?.user?.id);
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check. User ID:', session?.user?.id);
      if (session?.user) {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadInitialData = useCallback(async () => {
    console.log('Attempting to load initial data. Current userId:', userId);
    if (!userId) {
      console.log('No userId found, skipping initial data load.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching companies with stands for userId:', userId);
      const fetchedCompanies = await fetchCompaniesWithStands(userId);
      
      console.log('Fetching generic Excel data for userId:', userId);
      const fetchedGenericData = await fetchGenericExcelData(userId);

      const mergedCompanies = mergeGenericDataIntoCompanies(fetchedCompanies, fetchedGenericData);

      setCompanies(mergedCompanies);
      showSuccess("Dados CRM e informações complementares carregados com sucesso!");
    } catch (err: any) {
      console.error("Failed to load initial CRM data:", err);
      setError(`Falha ao carregar os dados iniciais do CRM: ${err.message}. Por favor, tente novamente.`);
      showError("Falha ao carregar os dados iniciais do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateCrmData = useCallback(async (newCompanies: Company[]) => {
    if (!userId) {
      showError("Utilizador não autenticado. Não foi possível atualizar os dados CRM.");
      return;
    }
    try {
      const fetchedGenericData = await fetchGenericExcelData(userId);
      const mergedCompanies = mergeGenericDataIntoCompanies(newCompanies, fetchedGenericData);
      setCompanies(mergedCompanies);
      showSuccess("Dados CRM atualizados com sucesso!");
    } catch (err: any) {
      console.error("Failed to update CRM data with generic info:", err);
      showError(`Falha ao atualizar dados CRM: ${err.message}`);
    }
  }, [userId]);

  React.useEffect(() => {
    if (userId) {
      console.log('userId changed, triggering loadInitialData...');
      loadInitialData();
    }
  }, [userId, loadInitialData]);

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