"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { CompanyAdditionalExcelData, Company } from '@/types/crm';
import { fetchCompanyAdditionalExcelData, fetchCompaniesByExcelCompanyIds } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import CompanyAdditionalList from '@/components/company-additional-data/CompanyAdditionalList';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CompanyAdditionalCreateForm from '@/components/company-additional-data/CompanyAdditionalCreateForm';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate

const CompanyAdditionalData: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyAdditionalExcelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [userId, setUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalCompanies, setTotalCompanies] = useState(0);

  const isSearching = isLoading && searchTerm !== '';

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
      console.log(`Attempting to fetch additional company data for userId: ${userId}, page: ${currentPage}, pageSize: ${pageSize}, searchTerm: ${debouncedSearchTerm}`);
      const { data: additionalData, totalCount } = await fetchCompanyAdditionalExcelData(userId, currentPage, pageSize, debouncedSearchTerm);
      setTotalCompanies(totalCount);

      const excelCompanyIds = additionalData.map(company => company.excel_company_id);

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

      const params = new URLSearchParams(location.search);
      const companyIdFromUrl = params.get('companyId');
      if (companyIdFromUrl) {
        // If a companyId is in the URL, navigate to its detail page
        navigate(`/company-additional-data/${companyIdFromUrl}`);
      }

    } catch (err: any) {
      console.error("Erro ao carregar dados adicionais das empresas:", err);
      setError(err.message || "Falha ao carregar os dados adicionais das empresas.");
      showError(err.message || "Falha ao carregar os dados adicionais das empresas.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPage, pageSize, debouncedSearchTerm, location.search, navigate]);

  useEffect(() => {
    if (userId) {
      loadCompanies();
    }
  }, [userId, loadCompanies]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSelectCompany = (companyExcelId: string) => {
    navigate(`/company-additional-data/${companyExcelId}`); // Navigate to the new detail page
  };

  const totalPages = Math.ceil(totalCompanies / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading && searchTerm === '') {
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
      <div className="h-full flex flex-col p-6"> {/* Added p-6 for consistent padding */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Empresas Adicionais ({totalCompanies})</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Criar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Empresa Adicional</DialogTitle>
              </DialogHeader>
              <CompanyAdditionalCreateForm
                onSave={() => {
                  setIsCreateDialogOpen(false);
                  loadCompanies();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-grow">
          <CompanyAdditionalList
            companies={companies}
            onSelectCompany={handleSelectCompany} // Use the new handler
            selectedCompanyId={null} // No longer needed to track selected ID in this component
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            isSearching={isSearching}
          />
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
      </div>
    </Layout>
  );
};

export default CompanyAdditionalData;