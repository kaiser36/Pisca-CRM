"use client";

import React, { useState, useEffect, useMemo, useCallback, ElementType } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CompanyAdditionalExcelData, Company, Stand } from '@/types/crm';
import { fetchCompaniesByExcelCompanyIds, fetchStandsByCompanyDbId } from '@/integrations/supabase/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DealList from '@/components/company-additional-data/DealList';
import TaskList from '@/components/company-additional-data/TaskList';
import EmployeeList from '@/components/company-additional-data/EmployeeList';
import AccountContactList from '@/components/company-additional-data/AccountContactList';
import EasyvistaList from '@/components/company-additional-data/EasyvistaList';
import CompanyAdditionalDetailCard from '@/components/company-additional-data/CompanyAdditionalDetailCard';
import { format, parseISO } from 'date-fns';

const CompanyAdditionalDetailPage: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [company, setCompany] = useState<CompanyAdditionalExcelData | null>(null);
  const [crmCompany, setCrmCompany] = useState<Company | null>(null);
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState('details');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setInitialTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const loadCompanyDetails = useCallback(async () => {
    if (!id || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: companyData, error: companyError } = await supabase
        .from('company_additional_excel_data')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (companyError) throw companyError;
      if (!companyData) throw new Error("Empresa não encontrada.");

      setCompany(companyData);

      const [crmCompanies, fetchedStands] = await Promise.all([
        fetchCompaniesByExcelCompanyIds(userId, [companyData.excel_company_id]),
        companyData.company_db_id ? fetchStandsByCompanyDbId(userId, companyData.company_db_id) : Promise.resolve([])
      ]);

      const mainCrmCompany = crmCompanies.find(c => c.Company_id === companyData.excel_company_id) || null;
      setCrmCompany(mainCrmCompany);
      setStands(fetchedStands);

    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao carregar detalhes da empresa:", err);
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    loadCompanyDetails();
  }, [loadCompanyDetails]);

  const totalPublicados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.Publicados || 0), 0), [stands]);
  const totalArquivados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.Arquivados || 0), 0), [stands]);
  const totalGuardados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.Guardados || 0), 0), [stands]);
  const totalLeadsRecebidas = useMemo(() => stands.reduce((acc, stand) => acc + (stand.Leads_Recebidas || 0), 0), [stands]);
  const totalLeadsPendentes = useMemo(() => stands.reduce((acc, stand) => acc + (stand.Leads_Pendentes || 0), 0), [stands]);
  const totalLeadsExpiradas = useMemo(() => stands.reduce((acc, stand) => acc + (stand.leads_expiradas || 0), 0), [stands]);

  const alerts = useMemo(() => {
    const alertsList: string[] = [];
    if (crmCompany?.Is_CRB_Partner) alertsList.push("É parceiro Credibom.");
    if (company?.['Quer ser parceiro Credibom']) alertsList.push("Quer ser parceiro Credibom.");
    if (company?.['Quer CT']) alertsList.push("Quer CT.");
    return alertsList;
  }, [crmCompany, company]);

  const renderField = useCallback((Icon: ElementType, label: string, value: string | number | boolean | null | undefined, options: { isPlafond?: boolean; isDate?: boolean; isBoolean?: boolean; url?: string | null; className?: string; } = {}) => {
    const { isPlafond = false, isDate = false, isBoolean = false, url = null, className = '' } = options;
    let displayValue: React.ReactNode = value;

    if (value === null || value === undefined || value === '') {
      displayValue = <span className="text-gray-500">N/A</span>;
    } else if (isPlafond) {
      displayValue = `€${Number(value).toFixed(2)}`;
    } else if (isDate) {
      try {
        displayValue = format(parseISO(value as string), 'dd/MM/yyyy');
      } catch {
        displayValue = <span className="text-red-500">Data inválida</span>;
      }
    } else if (isBoolean) {
      displayValue = value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
    } else if (url) {
      displayValue = (
        <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
          {value} <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      );
    }

    return (
      <div className={`flex items-start space-x-3 ${className}`}>
        <Icon className="h-5 w-5 text-gray-500 mt-1" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <div className="text-base font-semibold">{displayValue}</div>
        </div>
      </div>
    );
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">A carregar...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">Erro: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline">
          <Link to="/companies-additional-data">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-center flex-1">{company?.['Nome Comercial'] || 'Detalhes da Empresa'}</h1>
        <Button asChild>
          <Link to={`/companies-additional-data/edit/${id}`}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={initialTab} className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="deals">Negócios</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="employees">Colaboradores</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="easyvista">Easyvista</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          {company && (
            <CompanyAdditionalDetailCard
              company={company}
              crmCompany={crmCompany}
              alerts={alerts}
              renderField={renderField}
            />
          )}
        </TabsContent>
        <TabsContent value="deals">
          {company && <DealList companyExcelId={company.excel_company_id} />}
        </TabsContent>
        <TabsContent value="tasks">
          {company && <TaskList companyExcelId={company.excel_company_id} onTaskChanged={loadCompanyDetails} />}
        </TabsContent>
        <TabsContent value="employees">
          {company && <EmployeeList companyExcelId={company.excel_company_id} onEmployeeChanged={loadCompanyDetails} />}
        </TabsContent>
        <TabsContent value="contacts">
          {company && <AccountContactList companyExcelId={company.excel_company_id} />}
        </TabsContent>
        <TabsContent value="easyvista">
          {company && <EasyvistaList companyExcelId={company.excel_company_id} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyAdditionalDetailPage;