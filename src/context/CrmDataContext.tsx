"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Company } from '@/types/crm';
import { parseStandsExcel } from '@/lib/excel-parser';
import { showSuccess, showError } from '@/utils/toast';

interface CrmContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  updateCrmData: (newCompanies: Company[]) => void;
  loadInitialData: () => Promise<void>;
}

const CrmDataContext = createContext<CrmContextType | undefined>(undefined);

export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await parseStandsExcel('/Stands_Pisca.xlsx');
      setCompanies(data);
      showSuccess("Dados CRM carregados com sucesso!");
    } catch (err) {
      console.error("Failed to load initial CRM data:", err);
      setError("Falha ao carregar os dados iniciais do CRM. Por favor, tente novamente.");
      showError("Falha ao carregar os dados iniciais do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCrmData = useCallback((newCompanies: Company[]) => {
    setCompanies(newCompanies);
    showSuccess("Dados CRM atualizados com sucesso!");
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