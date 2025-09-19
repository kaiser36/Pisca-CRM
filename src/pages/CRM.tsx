import React from 'react';
import { useCrmData } from '@/hooks/use-crm-data';
import CompanyList from '@/components/crm/CompanyList';
import CompanyDetail from '@/components/crm/CompanyDetail';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ChevronLeft, ChevronRight } from 'lucide-react'; // Import ChevronLeft and ChevronRight
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button'; // Import Button
import { cn } from '@/lib/utils'; // Import cn for conditional class names

const CRM: React.FC = () => {
  const { companies, isLoading, error } = useCrmData();
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(null);
  const [isCompanyListCollapsed, setIsCompanyListCollapsed] = React.useState(false); // New state for collapsing the list

  const selectedCompany = React.useMemo(() => {
    return companies.find(company => company.Company_id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  const toggleCompanyList = () => {
    setIsCompanyListCollapsed(!isCompanyListCollapsed);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-48px)]">
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
        <div className="container mx-auto p-6">
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
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Company List Section */}
          <div className={cn(
            "flex flex-col h-full transition-all duration-300 ease-in-out",
            isCompanyListCollapsed ? "w-0 overflow-hidden md:w-auto md:col-span-0" : "md:col-span-1"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Empresas ({companies.length})</h2>
              <Button variant="ghost" size="icon" onClick={toggleCompanyList} className="ml-2">
                {isCompanyListCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>
            {!isCompanyListCollapsed && (
              <CompanyList
                companies={companies}
                onSelectCompany={setSelectedCompanyId}
                selectedCompanyId={selectedCompanyId}
              />
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
      </div>
    </Layout>
  );
};

export default CRM;