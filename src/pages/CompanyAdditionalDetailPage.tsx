"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { getCompanyAdditionalExcelDataByCompanyId, getCompanyByExcelId, getStandsByCompanyExcelId, getEasyvistasByCompanyExcelId } from '@/integrations/supabase/services/companyAdditionalDataService';
import { CompanyAdditionalExcelData, Company, Stand, Easyvista } from '@/types/crm';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import CompanyAdditionalDetailCard from '@/components/company-additional-data/CompanyAdditionalDetailCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CompanyAdditionalDetailPage: React.FC = () => {
  const { user } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<CompanyAdditionalExcelData | null>(null);
  const [crmCompany, setCrmCompany] = useState<Company | null>(null);
  const [stands, setStands] = useState<Stand[]>([]);
  const [easyvistas, setEasyvistas] = useState<Easyvista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState('overview');

  const loadCompanyDetails = useCallback(async () => {
    if (!user || !companyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [companyData, crmCompanyData] = await Promise.all([
        getCompanyAdditionalExcelDataByCompanyId(user.id, companyId),
        getCompanyByExcelId(user.id, companyId)
      ]);

      if (!companyData) {
        throw new Error('Dados adicionais da empresa não encontrados.');
      }
      if (!crmCompanyData) {
        throw new Error('Dados da empresa no CRM não encontrados.');
      }

      setCompany(companyData);
      setCrmCompany(crmCompanyData);

      const [standsData, easyvistasData] = await Promise.all([
        getStandsByCompanyExcelId(user.id, companyId),
        getEasyvistasByCompanyExcelId(user.id, companyId)
      ]);

      setStands(standsData);
      setEasyvistas(easyvistasData);

    } catch (err: any) {
      const errorMessage = `Erro ao carregar detalhes da empresa: ${err.message}`;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, companyId]);

  useEffect(() => {
    loadCompanyDetails();
  }, [loadCompanyDetails]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setInitialTab(tab);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-1/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
      </Button>
      {company && crmCompany && (
        <CompanyAdditionalDetailCard 
          company={company} 
          crmCompany={crmCompany}
          stands={stands}
          easyvistas={easyvistas}
          onDataChange={loadCompanyDetails} 
        />
      )}
    </div>
  );
};

export default CompanyAdditionalDetailPage;