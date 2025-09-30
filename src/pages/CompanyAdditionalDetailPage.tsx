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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                </div>
              </div>
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
              {/* Quick Actions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
                  </Button>
                </div>
              </div>

              {/* Company Info Section */}
              {company && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Informações Rápidas</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600">ID Excel:</span>
                      <span className="ml-2 text-gray-800">{company.excel_company_id}</span>
                    </div>
                    {company["Nome Comercial"] && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-600">Nome Comercial:</span>
                        <span className="ml-2 text-gray-800">{company["Nome Comercial"]}</span>
                      </div>
                    )}
                    {company["Email da empresa"] && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-600">Email:</span>
                        <span className="ml-2 text-gray-800 text-xs">{company["Email da empresa"]}</span>
                      </div>
                    )}
                    {company["Classificação"] && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">Classificação:</span>
                        <span className="ml-2 text-gray-800">{company["Classificação"]}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Section */}
              {company?.crmCompany && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Status CRM</h3>
                  <div className="space-y-3 text-sm">
                    {company.crmCompany.Plan_Active !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Plano Ativo:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.crmCompany.Plan_Active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {company.crmCompany.Plan_Active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    )}
                    {company.crmCompany.Is_CRB_Partner !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Parceiro CRB:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.crmCompany.Is_CRB_Partner 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.crmCompany.Is_CRB_Partner ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    )}
                    {company.crmCompany.Financing_Simulator_On !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Simulador:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.crmCompany.Financing_Simulator_On 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.crmCompany.Financing_Simulator_On ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Help */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Navegação</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Use as abas acima para explorar:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Detalhes completos da empresa</li>
                    <li>Stands e pontos de venda</li>
                    <li>Histórico de contactos</li>
                    <li>Registos Easyvista</li>
                    <li>Negócios e oportunidades</li>
                    <li>Colaboradores e equipa</li>
                    <li>Tarefas pendentes</li>
                    <li>Análises de campanhas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyAdditionalDetailPage;