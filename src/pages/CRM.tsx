import React from 'react';
import { useCrmData } from '@/context/CrmDataContext';
import CompanyList from '@/components/crm/CompanyList';
import CompanyDetail from '@/components/crm/CompanyDetail';
import CompanyFilter from '@/components/crm/CompanyFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import Button from '@mui/material/Button'; // Import MUI Button
import Card from '@mui/material/Card'; // Import MUI Card
import CardContent from '@mui/material/CardContent'; // Import MUI CardContent
import Typography from '@mui/material/Typography'; // Import MUI Typography
import Box from '@mui/material/Box'; // Import MUI Box for layout

const CRM: React.FC = () => {
  const { companies, isLoading, error } = useCrmData();
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(null);
  const [isCompanyListCollapsed, setIsCompanyListCollapsed] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const isMobile = useIsMobile();

  const filteredCompanies = React.useMemo(() => {
    if (!searchTerm) {
      return companies;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return companies.filter(company =>
      company.Company_Name.toLowerCase().includes(lowercasedSearchTerm) ||
      company.NIF.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [companies, searchTerm]);

  const selectedCompany = React.useMemo(() => {
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
        <Box sx={{ container: 'true', mx: 'auto', p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </Box>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ container: 'true', mx: 'auto', p: 3, minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))' }}>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
        {isMobile ? (
          // Mobile View
          selectedCompanyId ? (
            // Show Company Detail on mobile
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <Button variant="text" onClick={handleBackToCompanyList} sx={{ minWidth: 0, padding: 1, mr: 1 }}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold' }}>Detalhes da Empresa</Typography>
              </Box>
              <CompanyDetail company={selectedCompany} onBack={handleBackToCompanyList} />
            </Box>
          ) : (
            // Show Company List on mobile
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', marginBottom: 2 }}>Empresas ({filteredCompanies.length})</Typography>
              <CompanyFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              <CompanyList
                companies={filteredCompanies}
                onSelectCompany={setSelectedCompanyId}
                selectedCompanyId={selectedCompanyId}
              />
            </Box>
          )
        ) : (
          // Desktop View
          <Box sx={{ flexGrow: 1, display: 'grid', gridTemplateColumns: isCompanyListCollapsed ? '1fr' : '1fr 2fr', gap: 3 }}>
            {/* Company List Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 300ms ease-in-out', width: isCompanyListCollapsed ? 0 : 'auto', overflow: isCompanyListCollapsed ? 'hidden' : 'visible' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold' }}>Empresas ({filteredCompanies.length})</Typography>
                <Button variant="text" onClick={toggleCompanyList} sx={{ minWidth: 0, padding: 1, ml: 1 }}>
                  {isCompanyListCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </Box>
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
            </Box>

            {/* Company Detail Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', marginBottom: 2 }}>Detalhes da Empresa</Typography>
              <CompanyDetail company={selectedCompany} />
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default CRM;