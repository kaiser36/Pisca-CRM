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

const CompanyAdditionalDetailPage: React.FC = () => {
  const { companyExcelId } = useParams<{ companyExcelId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState<CompanyAdditionalExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
    try {
      // Fetch the specific additional company data
      const { data: additionalData } = await fetchCompanyAdditionalExcelData(userId, 1, 1, companyExcelId);
      const fetchedAdditionalCompany = additionalData.find(c => c.excel_company_id === companyExcelId);

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

    } catch (err: any) {
      console.error("Erro ao carregar detalhes da empresa adicional:", err);
      setError(err.message || "Falha ao carregar os detalhes da empresa adicional.");
      showError(err.message || "Falha ao carregar os detalhes da empresa adicional.");
    } finally {
      setIsLoading(false);
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

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'details';

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Button variant="outline" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
          </Button>
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
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
        </Button>
        {company && (
          <CompanyAdditionalDetailCard 
            company={company} 
            onDataUpdated={loadCompanyDetails} 
            initialTab={initialTab}
            theme="blue" // Aplicando tema azul para Empresas Adicionais
          />
        )}
      </div>
    </Layout>
  );
};

export default CompanyAdditionalDetailPage;