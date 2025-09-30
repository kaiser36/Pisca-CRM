import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Company, CompanyAdditionalExcelData } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CompanyAdditionalDetailCard from '@/components/company-additional-data/CompanyAdditionalDetailCard';
import CompanyAdditionalDataTabs from '@/components/company-additional-data/CompanyAdditionalDataTabs';

const CompanyAdditionalDetailPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [company, setCompany] = useState<CompanyAdditionalExcelData | null>(null);
  const [crmCompany, setCrmCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  }, [location.search]);

  const loadCompanyDetails = async () => {
    if (!companyId) {
      setError("ID da empresa não fornecido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch additional data
      const { data: additionalData, error: additionalError } = await supabase
        .from('company_additional_excel_data')
        .select('*')
        .eq('excel_company_id', companyId)
        .single();

      if (additionalError && additionalError.code !== 'PGRST116') { // Ignore 'single row not found'
        throw additionalError;
      }
      setCompany(additionalData);

      // Fetch main company data from CRM
      const { data: crmData, error: crmError } = await supabase
        .from('companies')
        .select(`
          *,
          stands (*),
          employees (*),
          negocios (*),
          tasks (*),
          account_contacts (*)
        `)
        .eq('company_id', companyId)
        .single();

      if (crmError) {
        throw crmError;
      }
      setCrmCompany(crmData);

    } catch (err: any) {
      console.error("Erro ao carregar detalhes da empresa:", err);
      setError(`Falha ao carregar dados: ${err.message}`);
      toast.error(`Falha ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyDetails();
  }, [companyId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><RefreshCw className="animate-spin h-8 w-8" /></div>;
  }

  if (error && !company && !crmCompany) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  
  if (!crmCompany) {
    return (
        <div className="container mx-auto p-4">
            <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-2">Empresa não encontrada</h2>
                <p className="text-gray-500">A empresa com o ID '{companyId}' não foi encontrada na base de dados principal.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold text-center">{crmCompany?.commercial_name || crmCompany?.company_name || 'Detalhes da Empresa'}</h1>
        <Button onClick={loadCompanyDetails} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </div>
      
      {crmCompany && (
        <CompanyAdditionalDataTabs 
          companyAdditional={company}
          crmCompany={crmCompany}
          onDataUpdated={loadCompanyDetails}
          initialTab={initialTab}
        />
      )}
    </div>
  );
};

export default CompanyAdditionalDetailPage;