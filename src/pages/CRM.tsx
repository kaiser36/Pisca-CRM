import React, { useState, useMemo } from 'react';
import { useCrmData } from '@/context/CrmDataContext';
import CompanyList from '@/components/crm/CompanyList';
import CompanyDetail from '@/components/crm/CompanyDetail';
import CompanyFilter from '@/components/crm/CompanyFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const CRM: React.FC = () => {
  const { companies, isLoading, error } = useCrmData();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCompanyListCollapsed, setIsCompanyListCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const filteredCompanies = useMemo(() => {
    if (!searchTerm) {
      return companies;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return companies.filter(company =>
      company.Company_Name.toLowerCase().includes(lowercasedSearchTerm) ||
      company.NIF.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [companies, searchTerm]);

  const selectedCompany = useMemo(() => {
    return companies.find(company => company.Company_id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  const toggleCompanyList = () => {
    setIsCompanyListCollapsed(!isCompanyListCollapsed);
  };

  const handleBackToCompanyList = () => {
    setSelectedCompanyId(null);
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
      <div className="h-full flex flex-col p-6"> {/* Added p-6 for consistent padding */}
        {isMobile ? (
          // Mobile View
          selectedCompanyId ? (
            // Show Company Detail on mobile
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" onClick={handleBackToCompanyList} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">Detalhes da Empresa</h2>
              </div>
              <CompanyDetail company={selectedCompany} onBack={handleBackToCompanyList} />
            </div>
          ) : (
            // Show Company List on mobile
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-4">Empresas ({filteredCompanies.length})</h2>
              <CompanyFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              <CompanyList
                companies={filteredCompanies}
                onSelectCompany={setSelectedCompanyId}
                selectedCompanyId={selectedCompanyId}
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
                <h2 className="text-xl font-semibold">Empresas ({filteredCompanies.length})</h2>
                <Button variant="ghost" size="icon" onClick={toggleCompanyList} className="ml-2">
                  {isCompanyListCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </div>
              {!isCompanyListCollapsed && (
                <>
                  <CompanyFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                  <CompanyList
                    companies={filteredCompanies}
                    onSelectCompany={setSelectedCompanyId}
                    selectedCompanyId={selectedCompanyId}
                  />
                </>
              )}
            </div>

            {/* Company Detail Section */}
            <div className={cn(
              "flex flex-col h-full",
              isCompanyListCollapsed ? "md:col-span-3" : "md:col-span-2"
            )}>
              <h2 className="text-xl font-semibold mb-4">Detalhes da Empresa</h2>
              <CompanyDetail company={selectedCompany} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CRM;