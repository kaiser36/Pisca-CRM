"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { CompanyAdditionalExcelData } from '@/types/crm';
import { fetchCompanyAdditionalExcelData } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ChevronLeft, ChevronRight, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import CompanyAdditionalList from '@/components/company-additional-data/CompanyAdditionalList';
import CompanyAdditionalDetailCard from '@/components/company-additional-data/CompanyAdditionalDetailCard';

const CompanyAdditionalData: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyAdditionalExcelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCompanyListCollapsed, setIsCompanyListCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
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

  const loadCompanies = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setError("Utilizador não autenticado. Por favor, faça login para ver os dados adicionais das empresas.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting to fetch additional company data for userId: ${userId}`);
      const data = await fetchCompanyAdditionalExcelData(userId);
      setCompanies(data);
      console.log(`CompanyAdditionalData: Set ${data.length} companies into state.`);
    } catch (err: any) {
      console.error("Erro ao carregar dados adicionais das empresas:", err);
      setError(err.message || "Falha ao carregar os dados adicionais das empresas.");
      showError(err.message || "Falha ao carregar os dados adicionais das empresas.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadCompanies();
    }
  }, [userId, loadCompanies]);

  const selectedCompany = React.useMemo(() => {
    return companies.find(company => company.excel_company_id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  const toggleCompanyList = () => {
    setIsCompanyListCollapsed(!isCompanyListCollapsed);
  };

  const handleBackToCompanyList = () => {
    setSelectedCompanyId(null);
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {isMobile ? (
          // Mobile View
          selectedCompanyId ? (
            // Show Company Detail on mobile
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" onClick={handleBackToCompanyList} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">Detalhes da Empresa Adicional</h2>
              </div>
              <CompanyAdditionalDetailCard company={selectedCompany} onDataUpdated={loadCompanies} />
            </div>
          ) : (
            // Show Company List on mobile
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-4">Empresas Adicionais ({companies.length})</h2>
              <CompanyAdditionalList
                companies={companies}
                onSelectCompany={setSelectedCompanyId}
                selectedCompanyId={selectedCompanyId}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          )
        ) : (
          // Desktop View
          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Company List Section */}
            <div className={cn(
              "flex flex-col h-full transition-all duration-300 ease-in-out",
              isCompanyListCollapsed ? "w-0 overflow-hidden md:w-auto md:col-span-0" : "md:col-span-1"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Empresas Adicionais ({companies.length})</h2>
                <Button variant="ghost" size="icon" onClick={toggleCompanyList} className="ml-2">
                  {isCompanyListCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </div>
              {!isCompanyListCollapsed && (
                <CompanyAdditionalList
                  companies={companies}
                  onSelectCompany={setSelectedCompanyId}
                  selectedCompanyId={selectedCompanyId}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              )}
            </div>

            {/* Company Detail Section */}
            <div className={cn(
              "flex flex-col h-full",
              isCompanyListCollapsed ? "md:col-span-3" : "md:col-span-2"
            )}>
              <h2 className="text-xl font-semibold mb-4">Detalhes da Empresa Adicional</h2>
              <CompanyAdditionalDetailCard company={selectedCompany} onDataUpdated={loadCompanies} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompanyAdditionalData;