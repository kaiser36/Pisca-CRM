"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { CompanyAdditionalExcelData, Company } from '@/types/crm';
import { fetchCompanyAdditionalExcelData, fetchCompaniesByExcelCompanyIds } from '@/integrations/supabase/utils';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const CompanyAdditionalData: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyAdditionalExcelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCompanyListCollapsed, setIsCompanyListCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalCompanies, setTotalCompanies] = useState(0);

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
      console.log(`Attempting to fetch additional company data for userId: ${userId}, page: ${currentPage}, pageSize: ${pageSize}, searchTerm: ${searchTerm}`);
      const { data: additionalData, totalCount } = await fetchCompanyAdditionalExcelData(userId, currentPage, pageSize, searchTerm); // Pass searchTerm
      setTotalCompanies(totalCount);

      // Extract excel_company_ids from the currently paginated additional data
      const excelCompanyIds = additionalData.map(company => company.excel_company_id);

      // Fetch only the CRM companies that match the excel_company_ids on the current page
      const crmCompanies = await fetchCompaniesByExcelCompanyIds(userId, excelCompanyIds); 
      const crmCompaniesMap = new Map<string, Company>();
      crmCompanies.forEach(company => {
        crmCompaniesMap.set(company.Company_id, company);
      });

      const augmentedCompanies: CompanyAdditionalExcelData[] = additionalData.map(additionalCompany => ({
        ...additionalCompany,
        crmCompany: crmCompaniesMap.get(additionalCompany.excel_company_id),
      }));

      setCompanies(augmentedCompanies);
      console.log(`CompanyAdditionalData: Set ${augmentedCompanies.length} companies into state.`);
    } catch (err: any) {
      console.error("Erro ao carregar dados adicionais das empresas:", err);
      setError(err.message || "Falha ao carregar os dados adicionais das empresas.");
      showError(err.message || "Falha ao carregar os dados adicionais das empresas.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPage, pageSize, searchTerm]); // Add searchTerm to dependencies

  useEffect(() => {
    if (userId) {
      loadCompanies();
    }
  }, [userId, loadCompanies]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on new search
    setSelectedCompanyId(null); // Clear selection on new search
  };

  const selectedCompany = React.useMemo(() => {
    return companies.find(company => company.excel_company_id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  const toggleCompanyList = () => {
    setIsCompanyListCollapsed(!isCompanyListCollapsed);
  };

  const handleBackToCompanyList = () => {
    setSelectedCompanyId(null);
  };

  const totalPages = Math.ceil(totalCompanies / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedCompanyId(null); // Clear selection when changing page
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
          <div className="md:col-span-1 flex flex-col space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="md:col-span-2 flex flex-col space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-6 min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

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
              <h2 className="text-xl font-semibold mb-4">Empresas Adicionais ({totalCompanies})</h2>
              <CompanyAdditionalList
                companies={companies}
                onSelectCompany={setSelectedCompanyId}
                selectedCompanyId={selectedCompanyId}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange} // Use the new handler
              />
              {/* Add pagination for mobile */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink isActive>{currentPage}</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
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
                <h2 className="text-xl font-semibold">Empresas Adicionais ({totalCompanies})</h2>
                <Button variant="ghost" size="icon" onClick={toggleCompanyList} className="ml-2">
                  {isCompanyListCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </div>
              {!isCompanyListCollapsed && (
                <>
                  <CompanyAdditionalList
                    companies={companies}
                    onSelectCompany={setSelectedCompanyId}
                    selectedCompanyId={selectedCompanyId}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange} // Use the new handler
                  />
                  {/* Add pagination for desktop */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                            />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink isActive>{currentPage}</PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
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