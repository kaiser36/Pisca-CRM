"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { CompanyAdditionalExcelData, Company } from '@/types/crm';
import { fetchCompanyAdditionalExcelData, fetchCompaniesByExcelCompanyIds } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompanyAdditionalDetailCard from '@/components/company-additional-data/CompanyAdditionalDetailCard';
import AlertsCard from '@/components/company-additional-data/AlertsCard';
import ActivityTimeline from '@/components/company-additional-data/ActivityTimeline';
import { Negocio } from '@/types/crm';
import { fetchDealsByCompanyExcelId } from '@/integrations/supabase/utils';

const CompanyAdditionalDetailPage: React.FC = () => {
  const { companyExcelId } = useParams<{ companyExcelId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState<CompanyAdditionalExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deals, setDeals] = useState<Negocio[]>([]);
  const [isDealsLoading, setIsDealsLoading] = useState(true);

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

  const loadCompanyDetails = useCallback(async () => {
    if (!userId || !companyExcelId) {
      setIsLoading(false);
      setError("ID da empresa ou utilizador não autenticado.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setIsDealsLoading(true);
    try {
      // Try to fetch the company directly by excel_company_id first
      const { data: directData, error: directError } = await supabase
        .from('company_additional_excel_data')
        .select('*')
        .eq('excel_company_id', companyExcelId)
        .eq('user_id', userId)
        .single();

      let fetchedAdditionalCompany: CompanyAdditionalExcelData | null = null;

      if (directData && !directError) {
        fetchedAdditionalCompany = directData;
      } else {
        // Fallback: try the paginated search method
        const { data: additionalData } = await fetchCompanyAdditionalExcelData(userId, 1, 100, companyExcelId);
        const foundCompany = additionalData.find(c => c.excel_company_id === companyExcelId);
        if (foundCompany) {
          fetchedAdditionalCompany = foundCompany;
        }
      }

      if (!fetchedAdditionalCompany) {
        setError("Empresa adicional não encontrada.");
        return;
      }

      // Fetch CRM company data for the associated excel_company_id
      const crmCompanies = await fetchCompaniesByExcelCompanyIds(userId, [companyExcelId]);
      const crmCompany = crmCompanies.find(c => c.Company_id === companyExcelId);

      setCompany({
        ...fetchedAdditionalCompany,
        crmCompany: crmCompany || undefined,
      });

      // Fetch deals for the alerts card
      const fetchedDeals = await fetchDealsByCompanyExcelId(userId, companyExcelId);
      setDeals(fetchedDeals);

    } catch (err: any) {
      console.error("Erro ao carregar detalhes da empresa adicional:", err);
      setError(err.message || "Falha ao carregar os detalhes da empresa adicional.");
      showError(err.message || "Falha ao carregar os detalhes da empresa adicional.");
    } finally {
      setIsLoading(false);
      setIsDealsLoading(false);
    }
  }, [userId, companyExcelId]);

  useEffect(() => {
    if (userId && companyExcelId) {
      loadCompanyDetails();
    }
  }, [userId, companyExcelId, loadCompanyDetails]);

  const handleBack = () => {
    navigate('/company-additional-data');
  };

  // Determine initial tab from URL
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'details';

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Primary Column - 70% */}
            <div className="w-full lg:w-3/4 p-6">
              <Skeleton className="h-10 w-48 mb-4" />
              <Skeleton className="h-[500px] w-full" />
            </div>
            {/* Secondary Column - 30% */}
            <div className="w-full lg:w-1/4 bg-gray-100 border-l border-gray-200 rounded-l-lg p-6 shadow-sm">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Primary Column - 70% */}
            <div className="w-full lg:w-3/4 p-6">
              <Button variant="outline" onClick={handleBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
              </Button>
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
            {/* Secondary Column - 30% */}
            <div className="w-full lg:w-1/4 bg-gray-100 border-l border-gray-200 rounded-l-lg p-6 shadow-sm">
              {/* Empty secondary column on error */}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Primary Column - 70% */}
          <div className="w-full lg:w-3/4 p-6">
            <Button variant="outline" onClick={handleBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
            </Button>
            {company && <CompanyAdditionalDetailCard company={company} onDataUpdated={loadCompanyDetails} initialTab={initialTab} />}
          </div>
          
          {/* Secondary Column - 30% */}
          <div className="w-full lg:w-1/4 bg-gray-100 border-l border-gray-200 rounded-l-lg p-6 shadow-sm">
            <div className="space-y-6">
              {isDealsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <AlertsCard crmCompany={company?.crmCompany} deals={deals} companyAdditional={company} />
              )}
              <ActivityTimeline />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyAdditionalDetailPage;