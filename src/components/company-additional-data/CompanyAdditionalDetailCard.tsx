"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CompanyAdditionalExcelData, Negocio, Company } from '@/types/crm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail, MapPin, Building, Globe, DollarSign, Package, Repeat, TrendingUp, Car, CheckCircle, XCircle, Calendar, User, Phone, Tag, Info, Banknote, LinkIcon, Clock, Users, Factory, ShieldCheck, Pencil, Landmark, Briefcase, PlusCircle, MessageSquareMore, Eye, Wallet, BellRing, Handshake, UserPlus, Upload, Archive, Save, ArrowRight, Download, Hourglass, XCircle as ExpiredIcon, ListTodo, BarChart2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isPast, parseISO, differenceInMonths, differenceInDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { fetchDealsByCompanyExcelId } from '@/integrations/supabase/utils';
import { showError } from '@/utils/toast';

// Import new modular components
import CompanyAdditionalHeader from './CompanyAdditionalHeader';
import CompanyAdditionalOverviewCards from './CompanyAdditionalOverviewCards';
import CompanyAdditionalDetailsAccordion from './CompanyAdditionalDetailsAccordion';

// Child list components (already modular)
import StandCard from '@/components/crm/StandCard';
import AccountContactList from './AccountContactList';
import EasyvistaList from './EasyvistaList';
import DealList from './DealList';
import EmployeeList from './EmployeeList';
import TaskList from './TaskList';
import AnalyticsList from './AnalyticsList';

interface CompanyAdditionalDetailCardProps {
  company: CompanyAdditionalExcelData | null;
  onDataUpdated: () => void;
  initialTab?: string;
}

const CompanyAdditionalDetailCard: React.FC<CompanyAdditionalDetailCardProps> = ({ company, onDataUpdated, initialTab = 'details' }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateContactDialogOpen, setIsCreateContactDialogOpen] = useState(false);
  const [isCreateEasyvistaDialogOpen, setIsCreateEasyvistaDialogOpen] = useState(false);
  const [isCreateDealDialogOpen, setIsCreateDealDialogOpen] = useState(false);
  const [isCreateEmployeeDialogOpen, setIsCreateEmployeeDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isCreateAnalysisDialogOpen, setIsCreateAnalysisDialogOpen] = useState(false);
  const [deals, setDeals] = useState<Negocio[]>([]);
  const [isDealsLoading, setIsDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update activeTab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Fetch userId on component mount
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

  // Fetch deals when company or userId changes
  useEffect(() => {
    const loadDeals = async () => {
      if (!userId || !company?.excel_company_id) {
        setIsDealsLoading(false);
        return;
      }
      setIsDealsLoading(true);
      setDealsError(null);
      try {
        const fetchedDeals = await fetchDealsByCompanyExcelId(userId, company.excel_company_id);
        setDeals(fetchedDeals);
      } catch (err: any) {
        console.error("Erro ao carregar negócios para alertas:", err);
        setDealsError(err.message || "Falha ao carregar negócios para alertas.");
        showError(err.message || "Falha ao carregar negócios para alertas.");
      } finally {
        setIsDealsLoading(false);
      }
    };

    loadDeals();
  }, [userId, company?.excel_company_id]);


  if (!company) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4 rounded-lg border bg-card">
        Selecione uma empresa para ver os detalhes adicionais.
      </div>
    );
  }

  const crmCompany = company.crmCompany;

  // Helper to render fields consistently
  const renderField = useCallback((Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !label.includes('Plafond') && !label.includes('Preço') && !label.includes('Bumps') && !label.includes('Investimento') && !label.includes('Stock') && !label.includes('Percentagem'))) return null;

    let displayValue: React.ReactNode = value;
    if (typeof value === 'boolean') {
      displayValue = value ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sim</Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Não</Badge>
      );
    } else if (typeof value === 'number') {
      displayValue = value.toLocaleString('pt-PT');
    } else if (label.includes('Link') || label.includes('Site') || label.includes('Logotipo')) {
      displayValue = (
        <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {String(value)}
        </a>
      );
    } else if (label.includes('Data')) {
      try {
        const date = parseISO(String(value));
        if (!isNaN(date.getTime())) {
          displayValue = format(date, 'dd/MM/yyyy');
        } else {
          displayValue = String(value);
        }
      } catch {
        displayValue = String(value);
      }
    }

    return (
      <div className="flex items-center text-sm">
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}:</span> <span className="ml-1 text-foreground">{displayValue}</span>
      </div>
    );
  }, []);

  const companyDisplayName = company["Nome Comercial"] || crmCompany?.Commercial_Name || crmCompany?.Company_Name || "Empresa Desconhecida";
  const firstLetter = companyDisplayName.charAt(0).toUpperCase();
  const isCompanyClosed = company["Classificação"] === "Empresa encerrada";

  // Utility functions for date comparisons
  const isVisitOld = useCallback((dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    try {
      const date = parseISO(dateString);
      return differenceInMonths(new Date(), date) >= 3;
    } catch {
      return false;
    }
  }, []);

  // Calculate aggregated stand data
  const totalPublicados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Publicados || 0), 0) || 0;
  const totalArquivados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Arquivados || 0), 0) || 0;
  const totalGuardados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Guardados || 0), 0) || 0;

  // Calculate aggregated leads data
  const totalLeadsRecebidas = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Leads_Recebidas || 0), 0) || 0;
  const totalLeadsPendentes = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Leads_Pendentes || 0), 0) || 0;
  const totalLeadsExpiradas = crmCompany?.stands.reduce((sum, stand) => sum + (stand.leads_expiradas || 0), 0) || 0; // Corrected here

  // Alert logic
  const alerts: string[] = [];

  // 1. Se o plano estiver expirado
  const planExpirationDate = crmCompany?.Plan_Expiration_Date || null;
  if (planExpirationDate && isPast(parseISO(planExpirationDate))) {
    alerts.push("O plano da empresa expirou!");
  }

  // 2. Se o plano ativo estiver não (incluindo null/undefined)
  if (!crmCompany?.Plan_Active) {
    alerts.push("O plano da empresa não está ativo!");
  }

  // 3. Se a data da ultima visita for mais de 3 meses
  const lastVisitDate = company["Data ultima visita"] || crmCompany?.Last_Visit_Date || null;
  if (isVisitOld(lastVisitDate)) {
    alerts.push("A última visita foi há mais de 3 meses.");
  }

  // 4. Se o ultimo login foi à mais de uma semana atras (This alert was missing in the original logic, adding it based on previous context)
  const lastLoginDate = crmCompany?.Last_Login_Date;
  if (lastLoginDate) {
    try {
      const loginDate = parseISO(lastLoginDate);
      if (differenceInDays(new Date(), loginDate) > 7) {
        alerts.push(`Último login há mais de uma semana: ${format(loginDate, 'dd/MM/yyyy')}`);
      }
    } catch (e) {
      console.warn(`Could not parse Last_Login_Date for CRM Company ${crmCompany?.Company_id}: ${lastLoginDate}`);
    }
  }

  // 5. Negócios com data de fecho esperada expirada
  if (!isDealsLoading && !dealsError) {
    deals.forEach(deal => {
      if (deal.expected_close_date) {
        try {
          const expectedCloseDate = parseISO(deal.expected_close_date);
          if (isPast(expectedCloseDate)) {
            alerts.push(`Negócio "${deal.deal_name}" com data de fecho esperada expirada: ${format(expectedCloseDate, 'dd/MM/yyyy')}`);
          }
        } catch (e) {
          console.warn(`Could not parse expected_close_date for deal ${deal.id}: ${deal.expected_close_date}`);
        }
      }
    });
  }

  // 6. Se ele for Parceiro Credibom e o Simulador Financiamento = Não
  if (crmCompany?.Is_CRB_Partner === true && crmCompany?.Financing_Simulator_On === false) {
    alerts.push("É Parceiro Credibom, mas o Simulador de Financiamento está desativado.");
  }

  // 7. Se ele tiver Plano ativo = Sim e Renovação Automática= Não
  if (crmCompany?.Plan_Active === true && crmCompany?.Plan_Auto_Renewal === false) {
    alerts.push("Plano ativo, mas a Renovação Automática está desativada.");
  }

  // 8. Se a classificação for "Empresa encerrada"
  if (isCompanyClosed) {
    alerts.push("⛔ Empresa encerrada.");
  }

  return (
    <ScrollArea className="h-full w-full pr-4">
      <Card className="w-full shadow-md rounded-lg">
        <CardHeader className="pb-4">
          <CompanyAdditionalHeader
            company={company}
            companyDisplayName={companyDisplayName}
            firstLetter={firstLetter}
            isCompanyClosed={isCompanyClosed}
            onDataUpdated={onDataUpdated}
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
            isCreateContactDialogOpen={isCreateContactDialogOpen}
            setIsCreateContactDialogOpen={setIsCreateContactDialogOpen}
            isCreateEasyvistaDialogOpen={isCreateEasyvistaDialogOpen}
            setIsCreateEasyvistaDialogOpen={setIsCreateEasyvistaDialogOpen}
            isCreateDealDialogOpen={isCreateDealDialogOpen}
            setIsCreateDealDialogOpen={setIsCreateDealDialogOpen}
            isCreateEmployeeDialogOpen={isCreateEmployeeDialogOpen}
            setIsCreateEmployeeDialogOpen={setIsCreateEmployeeDialogOpen}
            isCreateTaskDialogOpen={isCreateTaskDialogOpen}
            setIsCreateTaskDialogOpen={setIsCreateTaskDialogOpen}
            isCreateAnalysisDialogOpen={isCreateAnalysisDialogOpen}
            setIsCreateAnalysisDialogOpen={setIsCreateAnalysisDialogOpen}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <CompanyAdditionalOverviewCards
            companyAdditional={company}
            crmCompany={crmCompany}
            alerts={alerts}
            totalPublicados={totalPublicados}
            totalArquivados={totalArquivados}
            totalGuardados={totalGuardados}
            totalLeadsRecebidas={totalLeadsRecebidas}
            totalLeadsPendentes={totalLeadsPendentes}
            totalLeadsExpiradas={totalLeadsExpiradas}
            renderField={renderField}
          />

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-8 h-10 rounded-lg bg-muted/70 p-1">
              <TabsTrigger
                value="details"
                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold"
              >
                Detalhes
              </TabsTrigger>
              <TabsTrigger
                value="stands"
                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold"
              >
                Stands
              </TabsTrigger>
              <TabsTrigger
                value="contacts"
                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold"
              >
                Contactos
              </TabsTrigger>
              <TabsTrigger
                value="easyvistas"
                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold"
              >
                Easyvistas
              </TabsTrigger>
              <TabsTrigger
                value="deals"
                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold"
              >
                Negócios
              </TabsTrigger>
              <TabsTrigger
                value="employees"
                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold"
              >
                Colaboradores
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold"
              >
                Tarefas
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold"
              >
                Análises
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4 space-y-6">
              <CompanyAdditionalDetailsAccordion
                companyAdditional={company}
                crmCompany={crmCompany}
                renderField={renderField}
              />
              <Separator className="my-6" />
              <p className="text-xs text-muted-foreground">
                Criado em: {company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'}
              </p>
            </TabsContent>
            <TabsContent value="stands" className="mt-4">
              {crmCompany && crmCompany.stands && crmCompany.stands.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crmCompany.stands.map((stand) => (
                    <StandCard key={stand.Stand_ID} stand={stand} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum stand associado encontrado no CRM principal.</p>
              )}
            </TabsContent>
            <TabsContent value="contacts" className="mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                <MessageSquareMore className="mr-2 h-5 w-5" /> Histórico de Contactos
              </h3>
              <AccountContactList companyExcelId={company.excel_company_id} />
            </TabsContent>
            <TabsContent value="easyvistas" className="mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                <Eye className="mr-2 h-5 w-5" /> Registos Easyvista
              </h3>
              <EasyvistaList companyExcelId={company.excel_company_id} />
            </TabsContent>
            <TabsContent value="deals" className="mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                <Handshake className="mr-2 h-5 w-5" /> Negócios
              </h3>
              <DealList companyExcelId={company.excel_company_id} />
            </TabsContent>
            <TabsContent value="employees" className="mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                <Users className="mr-2 h-5 w-5" /> Colaboradores
              </h3>
              <EmployeeList companyExcelId={company.excel_company_id} onEmployeeChanged={onDataUpdated} />
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                <ListTodo className="mr-2 h-5 w-5" /> Tarefas
              </h3>
              <TaskList companyExcelId={company.excel_company_id} onTaskChanged={onDataUpdated} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                <BarChart2 className="mr-2 h-5 w-5" /> Análises de Campanhas
              </h3>
              <AnalyticsList companyExcelId={company.excel_company_id} onAnalyticsChanged={onDataUpdated} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default CompanyAdditionalDetailCard;