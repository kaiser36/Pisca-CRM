import React from 'react';
import { useCrmData } from '@/hooks/use-crm-data';
import CompanyList from '@/components/crm/CompanyList';
import CompanyDetail from '@/components/crm/CompanyDetail';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Layout from '@/components/layout/Layout'; // Import the new Layout component

const CRM: React.FC = () => {
  const { companies, isLoading, error } = useCrmData();
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(null);

  const selectedCompany = React.useMemo(() => {
    return companies.find(company => company.Company_id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  // Removido o useEffect que selecionava automaticamente a primeira empresa.
  // Agora, a secção de detalhes estará vazia até que uma empresa seja selecionada manualmente.

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
          <div className="md:col-span-1 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4">Empresas ({companies.length})</h2>
            <CompanyList
              companies={companies}
              onSelectCompany={setSelectedCompanyId}
              selectedCompanyId={selectedCompanyId}
            />
          </div>
          <div className="md:col-span-2 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4">Detalhes da Empresa</h2>
            <CompanyDetail company={selectedCompany} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CRM;