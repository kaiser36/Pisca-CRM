"use client";

import React, { useState } from 'react';
import { CompanyAdditionalExcelData, Negocio } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MapPin, Building, Globe, DollarSign, Package, Repeat, TrendingUp, Car, CheckCircle, XCircle, Calendar, User, Phone, Tag, Info, Banknote, LinkIcon, Clock, Users, Factory, ShieldCheck, Pencil, Landmark, Briefcase, PlusCircle, MessageSquareMore, Eye, Wallet, BellRing, Handshake, UserPlus, Upload, Archive, Save, ArrowRight, Download, Hourglass, XCircle as ExpiredIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CompanyAdditionalEditForm from './CompanyAdditionalEditForm';
import StandCard from '@/components/crm/StandCard';
import AccountContactCreateForm from './AccountContactCreateForm';
import AccountContactList from './AccountContactList';
import EasyvistaCreateForm from './EasyvistaCreateForm';
import EasyvistaList from './EasyvistaList';
import DealCreateForm from './DealCreateForm';
import DealList from './DealList';
import EmployeeCreateForm from './EmployeeCreateForm';
import EmployeeList from './EmployeeList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isPast, parseISO, differenceInMonths, differenceInDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { fetchDealsByCompanyExcelId } from '@/integrations/supabase/utils';
import { showError } from '@/utils/toast';

interface CompanyAdditionalDetailCardProps {
  company: CompanyAdditionalExcelData | null;
  onDataUpdated: () => void;
}

const CompanyAdditionalDetailCard: React.FC<CompanyAdditionalDetailCardProps> = ({ company, onDataUpdated }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateContactDialogOpen, setIsCreateContactDialogOpen] = useState(false);
  const [isCreateEasyvistaDialogOpen, setIsCreateEasyvistaDialogOpen] = useState(false);
  const [isCreateDealDialogOpen, setIsCreateDealDialogOpen] = useState(false);
  const [isCreateEmployeeDialogOpen, setIsCreateEmployeeDialogOpen] = useState(false);
  const [deals, setDeals] = useState<Negocio[]>([]);
  const [isDealsLoading, setIsDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
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

  React.useEffect(() => {
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

  // Helper function to render a single detail field with consistent styling
  const renderDetailField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !label.includes('Plafond') && !label.includes('Preço') && !label.includes('Bumps') && !label.includes('Investimento') && !label.includes('Stock') && !label.includes('Percentagem'))) return null;

    let displayValue: React.ReactNode = value;
    if (typeof value === 'boolean') {
      displayValue = value ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Sim</Badge>
      ) : (
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Não</Badge>
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
          displayValue = date.toLocaleDateString('pt-PT', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } else {
          displayValue = String(value);
        }
      } catch {
        displayValue = String(value);
      }
    }

    return (
      <div className="flex justify-between items-center py-1">
        <span className="flex items-center text-sm font-medium text-muted-foreground">
          <Icon className="mr-2 h-4 w-4" /> {label}:
        </span>
        <span className="text-sm font-semibold text-foreground">{displayValue}</span>
      </div>
    );
  };

  const companyDisplayName = company["Nome Comercial"] || company.crmCompany?.Company_Name || "Empresa Desconhecida";
  const firstLetter = companyDisplayName.charAt(0).toUpperCase();

  const isVisitOld = (dateString: string): boolean => {
    try {
      const date = parseISO(dateString);
      return differenceInMonths(new Date(), date) >= 3;
    } catch {
      return false;
    }
  };

  const crmCompany = company.crmCompany;
  const totalPublicados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Publicados || 0), 0) || 0;
  const totalArquivados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Arquivados || 0), 0) || 0;
  const totalGuardados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Guardados || 0), 0) || 0;

  const totalLeadsRecebidas = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Leads_Recebidas || 0), 0) || 0;
  const totalLeadsPendentes = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Leads_Pendentes || 0), 0) || 0;
  const totalLeadsExpiradas = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Leads_Expiradas || 0), 0) || 0;

  const alerts: string[] = [];
  
  const planExpirationDate = crmCompany?.Plan_Expiration_Date || null;
  if (planExpirationDate && isPast(parseISO(planExpirationDate))) {
    alerts.push("O plano da empresa expirou!");
  }

  if (!crmCompany?.Plan_Active) {
    alerts.push("O plano da empresa não está ativo!");
  }

  const lastVisitDate = company["Data ultima visita"] || crmCompany?.Last_Visit_Date || null;
  if (lastVisitDate && isVisitOld(lastVisitDate)) {
    alerts.push("A última visita foi há mais de 3 meses.");
  }

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

  if (crmCompany?.Is_CRB_Partner === true && crmCompany?.Financing_Simulator_On === false) {
    alerts.push("É Parceiro Credibom, mas o Simulador de Financiamento está desativado.");
  }

  if (crmCompany?.Plan_Active === true && crmCompany?.Plan_Auto_Renewal === false) {
    alerts.push("Plano ativo, mas a Renovação Automática está desativada.");
  }

  const isCompanyClosed = company["Classificação"] === "Empresa encerrada";
  if (isCompanyClosed) {
    alerts.push("⛔ Empresa encerrada.");
  }

  return (
    <ScrollArea className="h-full w-full pr-4">
      <Card className="w-full shadow-lg border-2 border-gray-100 dark:border-gray-800">
        <CardHeader className="pb-4 px-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16 border-2 border-primary shadow-md">
                <AvatarImage src={company["Logotipo"] || undefined} alt={companyDisplayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
                  {companyDisplayName}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  ID Excel: <span className="font-semibold text-foreground">{company.excel_company_id}</span>
                  {isCompanyClosed && (
                    <Badge variant="destructive" className="ml-3 text-xs px-2 py-0.5">Empresa Encerrada</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Dialog open={isCreateContactDialogOpen} onOpenChange={setIsCreateContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Contacto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Contacto de Conta</DialogTitle>
                  </DialogHeader>
                  <AccountContactCreateForm
                    companyExcelId={company.excel_company_id}
                    commercialName={company["Nome Comercial"]}
                    companyName={company.crmCompany?.Company_Name || company["Nome Comercial"]}
                    onSave={() => { setIsCreateContactDialogOpen(false); onDataUpdated(); }}
                    onCancel={() => setIsCreateContactDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateEasyvistaDialogOpen} onOpenChange={setIsCreateEasyvistaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <Eye className="mr-2 h-4 w-4" /> Novo Easyvista
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Registo Easyvista</DialogTitle>
                  </DialogHeader>
                  <EasyvistaCreateForm
                    companyExcelId={company.excel_company_id}
                    commercialName={company["Nome Comercial"]}
                    onSave={() => { setIsCreateEasyvistaDialogOpen(false); onDataUpdated(); }}
                    onCancel={() => setIsCreateEasyvistaDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateDealDialogOpen} onOpenChange={setIsCreateDealDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <Handshake className="mr-2 h-4 w-4" /> Novo Negócio
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Negócio</DialogTitle>
                  </DialogHeader>
                  <DealCreateForm
                    companyExcelId={company.excel_company_id}
                    commercialName={company["Nome Comercial"] || company.crmCompany?.Commercial_Name}
                    onSave={() => { setIsCreateDealDialogOpen(false); onDataUpdated(); }}
                    onCancel={() => setIsCreateDealDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateEmployeeDialogOpen} onOpenChange={setIsCreateEmployeeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <UserPlus className="mr-2 h-4 w-4" /> Novo Colaborador
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
                  </DialogHeader>
                  <EmployeeCreateForm
                    companyExcelId={company.excel_company_id}
                    commercialName={company["Nome Comercial"] || company.crmCompany?.Commercial_Name}
                    onSave={() => { setIsCreateEmployeeDialogOpen(false); onDataUpdated(); }}
                    onCancel={() => setIsCreateEmployeeDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="text-sm">
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Dados Adicionais da Empresa</DialogTitle>
                  </DialogHeader>
                  <CompanyAdditionalEditForm
                    company={company}
                    onSave={() => {
                      setIsEditDialogOpen(false);
                      onDataUpdated();
                    }}
                    onCancel={() => setIsEditDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-6">
          {/* Main Overview Card - Key Contact Info & Pipelines */}
          <Card className="p-6 shadow-inner border border-gray-200 dark:border-gray-700 bg-background">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 mb-6">
              {renderDetailField(Mail, "Email", company["Email da empresa"] || crmCompany?.Company_Email)}
              {renderDetailField(Globe, "Website", company["Site"] || crmCompany?.Website)}
              {renderDetailField(Landmark, "NIF", crmCompany?.NIF)}
              {renderDetailField(User, "AM Atual", company["AM"] || crmCompany?.AM_Current)}
            </div>

            <Separator className="my-6" />

            {/* Aggregated Stand Data - Anúncios Pipeline */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-muted-foreground mb-3 flex items-center">
                <Package className="mr-2 h-4 w-4" /> Anúncios (Todos os Stands)
              </h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center font-medium text-blue-700 dark:text-blue-400">
                  <Upload className="mr-1 h-4 w-4" /> Publicados: <span className="ml-1 font-bold">{totalPublicados}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="flex items-center font-medium text-purple-700 dark:text-purple-400">
                  <Archive className="mr-1 h-4 w-4" /> Arquivados: <span className="ml-1 font-bold">{totalArquivados}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="flex items-center font-medium text-green-700 dark:text-green-400">
                  <Save className="mr-1 h-4 w-4" /> Guardados: <span className="ml-1 font-bold">{totalGuardados}</span>
                </span>
              </div>
            </div>

            {/* Aggregated Stand Data - Leads Pipeline */}
            <div>
              <h4 className="text-base font-semibold text-muted-foreground mb-3 flex items-center">
                <Download className="mr-2 h-4 w-4" /> Leads (Todos os Stands)
              </h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center font-medium text-blue-700 dark:text-blue-400">
                  <Download className="mr-1 h-4 w-4" /> Recebidas: <span className="ml-1 font-bold">{totalLeadsRecebidas}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="flex items-center font-medium text-orange-700 dark:text-orange-400">
                  <Hourglass className="mr-1 h-4 w-4" /> Pendentes: <span className="ml-1 font-bold">{totalLeadsPendentes}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="flex items-center font-medium text-red-700 dark:text-red-400">
                  <ExpiredIcon className="mr-1 h-4 w-4" /> Expiradas: <span className="ml-1 font-bold">{totalLeadsExpiradas}</span>
                </span>
              </div>
            </div>
          </Card>
          {/* End Main Overview Card */}

          {/* Overview Cards (Pisca, Resumo, Alertas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 shadow-subtle border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-700">
              <CardTitle className="text-lg font-semibold mb-3 flex items-center text-blue-800 dark:text-blue-300">
                <Package className="mr-2 h-5 w-5" /> Pisca
              </CardTitle>
              <div className="space-y-2">
                {renderDetailField(Package, "Último Plano", company["Plano Indicado"] || crmCompany?.Last_Plan)}
                {renderDetailField(CheckCircle, "Plano Ativo", crmCompany?.Plan_Active)}
                {renderDetailField(Calendar, "Expiração do Plano", crmCompany?.Plan_Expiration_Date)}
                {renderDetailField(Repeat, "Renovação Automática", crmCompany?.Plan_Auto_Renewal)}
                {renderDetailField(TrendingUp, "Bumps Totais", crmCompany?.Total_Bumps)}
                {renderDetailField(TrendingUp, "Bumps Atuais", crmCompany?.Current_Bumps)}
                {renderDetailField(Wallet, "Plafond", crmCompany?.Plafond)}
              </div>
            </Card>

            <Card className="p-5 shadow-subtle border-l-4 border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700">
              <CardTitle className="text-lg font-semibold mb-3 flex items-center text-green-800 dark:text-green-300">
                <Info className="mr-2 h-5 w-5" /> Resumo
              </CardTitle>
              <div className="space-y-2">
                {renderDetailField(Tag, "Classificação", company["Classificação"])}
                {renderDetailField(CheckCircle, "Parceiro Credibom", crmCompany?.Is_CRB_Partner)}
                {renderDetailField(Car, "Simulador Financiamento", crmCompany?.Financing_Simulator_On)}
                {renderDetailField(Clock, "Último Login", crmCompany?.Last_Login_Date)}
                {renderDetailField(Calendar, "Data Última Visita", company["Data ultima visita"])}
              </div>
            </Card>

            <Card className={`p-5 shadow-subtle border-l-4 ${alerts.length > 0 ? 'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-700' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700'}`}>
              <CardTitle className={`text-lg font-semibold mb-3 flex items-center ${alerts.length > 0 ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                <BellRing className="mr-2 h-5 w-5" /> Alertas
              </CardTitle>
              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <Alert className="bg-transparent border-none p-0 text-yellow-800 dark:text-yellow-300">
                    <AlertDescription className="flex items-center text-sm">
                      <CheckCircle className="mr-2 h-4 w-4" /> Sem alertas pendentes.
                    </AlertDescription>
                  </Alert>
                ) : (
                  alerts.map((alert, index) => (
                    <Alert key={index} variant="destructive" className="bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200 p-2 text-sm">
                      <AlertDescription className="flex items-center">
                        <Info className="mr-2 h-4 w-4" /> {alert}
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </Card>
          </div>
          {/* End Overview Cards */}

          <Tabs defaultValue="details" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 h-10">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="stands">Stands</TabsTrigger>
              <TabsTrigger value="contacts">Contactos</TabsTrigger>
              <TabsTrigger value="easyvistas">Easyvistas</TabsTrigger>
              <TabsTrigger value="deals">Negócios</TabsTrigger>
              <TabsTrigger value="employees">Colaboradores</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6 space-y-6">
              <Accordion type="multiple" className="w-full space-y-4">
                <AccordionItem value="essential-info" className="border rounded-lg shadow-sm bg-card dark:bg-card">
                  <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                    <div className="flex items-center text-foreground">
                      <Info className="mr-3 h-5 w-5 text-primary" />
                      Informações Essenciais da Empresa
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-4 border-t bg-muted/50 dark:bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {renderDetailField(Building, "Nome Fiscal", crmCompany?.Company_Name)}
                    {renderDetailField(Building, "Nome Comercial", company["Nome Comercial"])}
                    {renderDetailField(Landmark, "NIF", crmCompany?.NIF)}
                    {renderDetailField(Mail, "Email Principal", company["Email da empresa"] || crmCompany?.Company_Email)}
                    {renderDetailField(Globe, "Website", company["Site"] || crmCompany?.Website)}
                    {renderDetailField(Car, "Logotipo (URL)", company["Logotipo"])}
                    {renderDetailField(Building, "Tipo de Empresa", company["Tipo de empresa"])}
                    {renderDetailField(Factory, "Grupo", company["Grupo"])}
                    {renderDetailField(Tag, "Marcas Representadas", company["Marcas representadas"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="location-address" className="border rounded-lg shadow-sm bg-card dark:bg-card">
                  <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                    <div className="flex items-center text-foreground">
                      <MapPin className="mr-3 h-5 w-5 text-primary" />
                      Localização e Morada
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-4 border-t bg-muted/50 dark:bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {renderDetailField(MapPin, "Morada", company["Morada"] || crmCompany?.Company_Address)}
                    {renderDetailField(MapPin, "Código Postal", company["STAND_POSTAL_CODE"] || crmCompany?.Company_Postal_Code)}
                    {renderDetailField(MapPin, "Distrito", company["Distrito"] || crmCompany?.District)}
                    {renderDetailField(MapPin, "Cidade", company["Cidade"] || crmCompany?.Company_City)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-management" className="border rounded-lg shadow-sm bg-card dark:bg-card">
                  <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                    <div className="flex items-center text-foreground">
                      <User className="mr-3 h-5 w-5 text-primary" />
                      Gestão de Conta (AM)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-4 border-t bg-muted/50 dark:bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {renderDetailField(User, "Pessoa de Contacto (CRM)", crmCompany?.Company_Contact_Person)}
                    {renderDetailField(Briefcase, "Supervisor (CRM)", crmCompany?.Supervisor)}
                    {renderDetailField(User, "AM Antigo", company["AM_OLD"])}
                    {renderDetailField(User, "AM Atual", company["AM"])}
                    {renderDetailField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stock-api" className="border rounded-lg shadow-sm bg-card dark:bg-card">
                  <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                    <div className="flex items-center text-foreground">
                      <Package className="mr-3 h-5 w-5 text-primary" />
                      Dados de Stock e API
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-4 border-t bg-muted/50 dark:bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {renderDetailField(Package, "Stock STV", company["Stock STV"] || crmCompany?.Stock_STV)}
                    {renderDetailField(Package, "Stock na Empresa", company["Stock na empresa"] || crmCompany?.Company_Stock)}
                    {renderDetailField(Info, "API Info", company["API"] || crmCompany?.Company_API_Info)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="plan-financing" className="border rounded-lg shadow-sm bg-card dark:bg-card">
                  <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                    <div className="flex items-center text-foreground">
                      <DollarSign className="mr-3 h-5 w-5 text-primary" />
                      Detalhes do Plano e Financiamento
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-4 border-t bg-muted/50 dark:bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {renderDetailField(Wallet, "Plafond", crmCompany?.Plafond)}
                    {renderDetailField(Package, "Último Plano", company["Plano Indicado"] || crmCompany?.Last_Plan)}
                    {renderDetailField(DollarSign, "Preço do Plano", crmCompany?.Plan_Price)}
                    {renderDetailField(Calendar, "Expiração do Plano", crmCompany?.Plan_Expiration_Date)}
                    {renderDetailField(CheckCircle, "Plano Ativo", crmCompany?.Plan_Active)}
                    {renderDetailField(Repeat, "Renovação Automática", crmCompany?.Plan_Auto_Renewal)}
                    {renderDetailField(TrendingUp, "Bumps Atuais", crmCompany?.Current_Bumps)}
                    {renderDetailField(TrendingUp, "Bumps Totais", crmCompany?.Total_Bumps)}
                    {renderDetailField(Banknote, "Mediador de Crédito", company["Mediador de credito"])}
                    {renderDetailField(LinkIcon, "Link Banco de Portugal", company["Link do Banco de Portugal"])}
                    {renderDetailField(ShieldCheck, "Financeiras com Acordo", company["Financeiras com acordo"])}
                    {renderDetailField(Car, "Simulador Financiamento", crmCompany?.Financing_Simulator_On)}
                    {renderDetailField(Car, "Cor do Simulador", crmCompany?.Simulator_Color)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="marketing-competition" className="border rounded-lg shadow-sm bg-card dark:bg-card">
                  <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                    <div className="flex items-center text-foreground">
                      <TrendingUp className="mr-3 h-5 w-5 text-primary" />
                      Marketing e Concorrência
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-4 border-t bg-muted/50 dark:bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {renderDetailField(Tag, "Classificação", company["Classificação"])}
                    {renderDetailField(TrendingUp, "Percentagem de Importados", company["Percentagem de Importados"])}
                    {renderDetailField(Car, "Onde compra as viaturas", company["Onde compra as viaturas"])}
                    {renderDetailField(Users, "Concorrência", company["Concorrencia"])}
                    {renderDetailField(DollarSign, "Investimento Redes Sociais", company["Investimento redes sociais"])}
                    {renderDetailField(DollarSign, "Investimento em Portais", company["Investimento em portais"])}
                    {renderDetailField(Building, "Mercado B2B", company["Mercado b2b"])}
                    {renderDetailField(ShieldCheck, "Utiliza CRM", company["Utiliza CRM"])}
                    {renderDetailField(Info, "Qual o CRM", company["Qual o CRM"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="partnerships-other" className="border rounded-lg shadow-sm bg-card dark:bg-card">
                  <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                    <div className="flex items-center text-foreground">
                      <ShieldCheck className="mr-3 h-5 w-5 text-primary" />
                      Parcerias e Outros
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-4 border-t bg-muted/50 dark:bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {renderDetailField(CheckCircle, "Parceiro Credibom (CRM)", crmCompany?.Is_CRB_Partner)}
                    {renderDetailField(CheckCircle, "Parceiro APDCA (CRM)", crmCompany?.Is_APDCA_Partner)}
                    {renderDetailField(ShieldCheck, "Quer CT", company["Quer CT"])}
                    {renderDetailField(ShieldCheck, "Quer ser Parceiro Credibom (Adicional)", company["Quer ser parceiro Credibom"])}
                    {renderDetailField(Info, "Autobiz", company["Autobiz"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="important-dates" className="border rounded-lg shadow-sm bg-card dark:bg-card">
                  <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                    <div className="flex items-center text-foreground">
                      <Calendar className="mr-3 h-5 w-5 text-primary" />
                      Datas Importantes
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-4 border-t bg-muted/50 dark:bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {renderDetailField(Calendar, "Data de Criação (CRM)", crmCompany?.Creation_Date)}
                    {renderDetailField(Clock, "Último Login (CRM)", crmCompany?.Last_Login_Date)}
                    {renderDetailField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Separator className="my-6" />
              <p className="text-xs text-muted-foreground text-right">
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
          </Tabs>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default CompanyAdditionalDetailCard;