"use client";

import React, { useState } from 'react';
import { CompanyAdditionalExcelData, Negocio } from '@/types/crm'; // Import Negocio type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MapPin, Building, Globe, DollarSign, Package, Repeat, TrendingUp, Car, CheckCircle, XCircle, Calendar, User, Phone, Tag, Info, Banknote, LinkIcon, Clock, Users, Factory, ShieldCheck, Pencil, Landmark, Briefcase, PlusCircle, MessageSquareMore, Eye, Wallet, BellRing, Handshake, UserPlus, Upload, Archive, Save, ArrowRight, Download, Hourglass, XCircle as ExpiredIcon } from 'lucide-react'; // Added Download, Hourglass, ExpiredIcon
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
import EmployeeCreateForm from './EmployeeCreateForm'; // New import
import EmployeeList from './EmployeeList'; // New import
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
  const [isCreateEmployeeDialogOpen, setIsCreateEmployeeDialogOpen] = useState(false); // New state
  const [deals, setDeals] = useState<Negocio[]>([]);
  const [isDealsLoading, setIsDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch userId on component mount
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

  // Fetch deals when company or userId changes
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

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
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
          displayValue = date.toLocaleDateString('pt-PT', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
  };

  const companyDisplayName = company["Nome Comercial"] || company.crmCompany?.Company_Name || "Empresa Desconhecida";
  const firstLetter = companyDisplayName.charAt(0).toUpperCase();

  // Utility functions for date comparisons
  const isVisitOld = (dateString: string): boolean => {
    try {
      const date = parseISO(dateString);
      return differenceInMonths(new Date(), date) >= 3;
    } catch {
      return false;
    }
  };

  // Calculate aggregated stand data
  const crmCompany = company.crmCompany;
  const totalPublicados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Publicados || 0), 0) || 0;
  const totalArquivados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Arquivados || 0), 0) || 0;
  const totalGuardados = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Guardados || 0), 0) || 0;

  // Calculate aggregated leads data
  const totalLeadsRecebidas = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Leads_Recebidas || 0), 0) || 0;
  const totalLeadsPendentes = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Leads_Pendentes || 0), 0) || 0;
  const totalLeadsExpiradas = crmCompany?.stands.reduce((sum, stand) => sum + (stand.Leads_Expiradas || 0), 0) || 0;


  // Alert logic
  const alerts: string[] = [];
  

  // 1. Se o plano estiver expirado
  const planExpirationDate = crmCompany?.Plan_Expiration_Date || null;
  if (planExpirationDate && isPast(parseISO(planExpirationDate))) {
    alerts.push("O plano da empresa expirou!");
  }

  // 2. Se o plano ativo estiver não (incluindo null/undefined)
  if (!crmCompany?.Plan_Active) { // This condition now covers false, null, and undefined
    alerts.push("O plano da empresa não está ativo!");
  }

  // 3. Se a data da ultima visita for mais de 3 meses
  const lastVisitDate = company["Data ultima visita"] || crmCompany?.Last_Visit_Date || null;
  if (lastVisitDate && isVisitOld(lastVisitDate)) {
    alerts.push("A última visita foi há mais de 3 meses.");
  }

  // 4. Se o ultimo login foi à mais de uma semana atras
  if (!isDealsLoading && !dealsError) { // Only check deals if loaded successfully
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

  // 5. Se ele for Parceiro Credibom e o Simulador Financiamento = Não
  if (crmCompany?.Is_CRB_Partner === true && crmCompany?.Financing_Simulator_On === false) {
    alerts.push("É Parceiro Credibom, mas o Simulador de Financiamento está desativado.");
  }

  // 6. Se ele tiver Plano ativo = Sim e Renovação Automática= Não
  if (crmCompany?.Plan_Active === true && crmCompany?.Plan_Auto_Renewal === false) {
    alerts.push("Plano ativo, mas a Renovação Automática está desativada.");
  }

  // 7. Se a classificação for "Empresa encerrada"
  const isCompanyClosed = company["Classificação"] === "Empresa encerrada";
  if (isCompanyClosed) {
    alerts.push("⛔ Empresa encerrada.");
  }

  return (
    <ScrollArea className="h-full w-full pr-4">
      <Card className="w-full shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-16 w-16 mr-3"> {/* Increased size to h-16 w-16 */}
                <AvatarImage src={company["Logotipo"] || undefined} alt={companyDisplayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold"> {/* Adjusted fallback text size */}
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
              <div> {/* New div to group title and description */}
                <CardTitle className="text-2xl font-bold">{companyDisplayName}</CardTitle>
                <CardDescription className="text-muted-foreground">ID Excel: {company.excel_company_id}</CardDescription>
              </div>
              {isCompanyClosed && (
                <Badge variant="destructive" className="text-sm px-3 py-1">Empresa Encerrada</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isCreateContactDialogOpen} onOpenChange={(open) => { console.log('Create Contact Dialog open change:', open); setIsCreateContactDialogOpen(open); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
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
                    onSave={() => setIsCreateContactDialogOpen(false)}
                    onCancel={() => setIsCreateContactDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateEasyvistaDialogOpen} onOpenChange={(open) => { console.log('Create Easyvista Dialog open change:', open); setIsCreateEasyvistaDialogOpen(open); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
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
                    onSave={() => setIsCreateEasyvistaDialogOpen(false)}
                    onCancel={() => setIsCreateEasyvistaDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateDealDialogOpen} onOpenChange={(open) => { console.log('Create Deal Dialog open change:', open); setIsCreateDealDialogOpen(open); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
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
                    onSave={() => setIsCreateDealDialogOpen(false)}
                    onCancel={() => setIsCreateDealDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateEmployeeDialogOpen} onOpenChange={setIsCreateEmployeeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
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
                    onSave={() => setIsCreateEmployeeDialogOpen(false)}
                    onCancel={() => setIsCreateEmployeeDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isEditDialogOpen} onOpenChange={(open) => { console.log('Edit Dialog open change:', open); setIsEditDialogOpen(open); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
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
        <CardContent className="space-y-6">
          {/* Main Overview Card */}
          <Card className="p-6 shadow-subtle border-l-4 border-primary">
            <div className="flex flex-col items-center space-y-4"> {/* Changed to flex-col and items-center */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 flex-1 w-full"> {/* Added w-full */}
                {renderField(Mail, "Email", company["Email da empresa"] || crmCompany?.Company_Email)}
                {renderField(Globe, "Website", company["Site"] || crmCompany?.Website)}
                {renderField(Landmark, "NIF", crmCompany?.NIF)}
                {renderField(User, "AM Atual", company["AM"] || crmCompany?.AM_Current)}
                {/* Aggregated Stand Data - Anúncios Pipeline */}
                <div className="flex items-center text-sm md:col-span-2 flex-wrap gap-x-2">
                  <span className="font-medium flex items-center">
                    <Upload className="mr-1 h-4 w-4 text-muted-foreground" /> Publicados: <span className="ml-1 text-foreground">{totalPublicados}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium flex items-center">
                    <Archive className="mr-1 h-4 w-4 text-muted-foreground" /> Arquivados: <span className="ml-1 text-foreground">{totalArquivados}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium flex items-center">
                    <Save className="mr-1 h-4 w-4 text-muted-foreground" /> Guardados: <span className="ml-1 text-foreground">{totalGuardados}</span>
                  </span>
                </div>
                {/* Aggregated Stand Data - Leads Pipeline */}
                <div className="flex items-center text-sm md:col-span-2 flex-wrap gap-x-2 mt-2">
                  <span className="font-medium flex items-center text-blue-700">
                    <Download className="mr-1 h-4 w-4 text-blue-700" /> Leads Recebidas: <span className="ml-1">{totalLeadsRecebidas}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium flex items-center text-orange-700">
                    <Hourglass className="mr-1 h-4 w-4 text-orange-700" /> Leads Pendentes: <span className="ml-1">{totalLeadsPendentes}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium flex items-center text-red-700">
                    <ExpiredIcon className="mr-1 h-4 w-4 text-red-700" /> Leads Expiradas: <span className="ml-1">{totalLeadsExpiradas}</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>
          {/* End Main Overview Card */}

          {/* New Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pisca Card */}
            <Card className="p-4 shadow-subtle border-l-4 border-blue-200 bg-blue-50">
              <CardTitle className="text-lg font-semibold mb-3 flex items-center text-blue-800">
                <Package className="mr-2 h-5 w-5" /> Pisca
              </CardTitle>
              <div className="space-y-2">
                {renderField(Package, "Último Plano", company["Plano Indicado"] || crmCompany?.Last_Plan)}
                {renderField(CheckCircle, "Plano Ativo", crmCompany?.Plan_Active)}
                {renderField(Calendar, "Expiração do Plano", crmCompany?.Plan_Expiration_Date)}
                {renderField(Repeat, "Renovação Automática", crmCompany?.Plan_Auto_Renewal)}
                {renderField(TrendingUp, "Bumps Totais", crmCompany?.Total_Bumps)}
                {renderField(TrendingUp, "Bumps Atuais", crmCompany?.Current_Bumps)}
                {renderField(Wallet, "Plafond", crmCompany?.Plafond)} {/* Moved Plafond here */}
              </div>
            </Card>

            {/* Resumo Card */}
            <Card className="p-4 shadow-subtle border-l-4 border-green-200 bg-green-50">
              <CardTitle className="text-lg font-semibold mb-3 flex items-center text-green-800">
                <Info className="mr-2 h-5 w-5" /> Resumo
              </CardTitle>
              <div className="space-y-2">
                {renderField(Tag, "Classificação", company["Classificação"])}
                {renderField(CheckCircle, "Parceiro Credibom", crmCompany?.Is_CRB_Partner)}
                {renderField(Car, "Simulador Financiamento", crmCompany?.Financing_Simulator_On)}
                {renderField(Clock, "Último Login", crmCompany?.Last_Login_Date)}
                {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
              </div>
            </Card>

            {/* Alertas Card */}
            <Card className={`p-4 shadow-subtle border-l-4 ${alerts.length > 0 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <CardTitle className={`text-lg font-semibold mb-3 flex items-center ${alerts.length > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
                <BellRing className="mr-2 h-5 w-5" /> Alertas
              </CardTitle>
              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <Alert className="bg-transparent border-none p-0 text-yellow-800">
                    <AlertDescription className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" /> Sem alertas pendentes.
                    </AlertDescription>
                  </Alert>
                ) : (
                  alerts.map((alert, index) => (
                    <Alert key={index} variant="destructive" className="bg-red-100 border-red-200 text-red-800 p-2">
                      <AlertDescription className="flex items-center">
                        <Info className="mr-2 h-4 w-4" /> {alert}
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </Card>
          </div>
          {/* End New Overview Cards */}

          <Tabs defaultValue="details" onValueChange={(value) => console.log('Tab changed to:', value)}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-10">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="stands">Stands</TabsTrigger>
              <TabsTrigger value="contacts">Contactos</TabsTrigger>
              <TabsTrigger value="easyvistas">Easyvistas</TabsTrigger>
              <TabsTrigger value="deals">Negócios</TabsTrigger>
              <TabsTrigger value="employees">Colaboradores</TabsTrigger> {/* New Tab */}
            </TabsList>
            <TabsContent value="details" className="mt-4 space-y-6">
              <Accordion type="multiple" className="w-full space-y-4">
                <AccordionItem value="essential-info" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <Info className="mr-2 h-5 w-5 text-muted-foreground" />
                      Informações Essenciais da Empresa
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Building, "Nome Fiscal", crmCompany?.Company_Name)}
                    {renderField(Building, "Nome Comercial", company["Nome Comercial"])}
                    {renderField(Landmark, "NIF", crmCompany?.NIF)}
                    {renderField(Mail, "Email Principal", company["Email da empresa"] || crmCompany?.Company_Email)}
                    {renderField(Globe, "Website", company["Site"] || crmCompany?.Website)}
                    {renderField(Car, "Logotipo (URL)", company["Logotipo"])}
                    {renderField(Building, "Tipo de Empresa", company["Tipo de empresa"])}
                    {renderField(Factory, "Grupo", company["Grupo"])}
                    {renderField(Tag, "Marcas Representadas", company["Marcas representadas"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="location-address" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                      Localização e Morada
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(MapPin, "Morada", company["Morada"] || crmCompany?.Company_Address)}
                    {renderField(MapPin, "Código Postal", company["STAND_POSTAL_CODE"] || crmCompany?.Company_Postal_Code)}
                    {renderField(MapPin, "Distrito", company["Distrito"] || crmCompany?.District)}
                    {renderField(MapPin, "Cidade", company["Cidade"] || crmCompany?.Company_City)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-management" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-muted-foreground" />
                      Gestão de Conta (AM)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(User, "Pessoa de Contacto (CRM)", crmCompany?.Company_Contact_Person)}
                    {renderField(Briefcase, "Supervisor (CRM)", crmCompany?.Supervisor)}
                    {renderField(User, "AM Antigo", company["AM_OLD"])}
                    {renderField(User, "AM Atual", company["AM"])}
                    {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stock-api" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <Package className="mr-2 h-5 w-5 text-muted-foreground" />
                      Dados de Stock e API
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Package, "Stock STV", company["Stock STV"] || crmCompany?.Stock_STV)}
                    {renderField(Package, "Stock na Empresa", company["Stock na empresa"] || crmCompany?.Company_Stock)}
                    {renderField(Info, "API Info", company["API"] || crmCompany?.Company_API_Info)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="plan-financing" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                      Detalhes do Plano e Financiamento
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Wallet, "Plafond", crmCompany?.Plafond)}
                    {renderField(Package, "Último Plano", company["Plano Indicado"] || crmCompany?.Last_Plan)}
                    {renderField(DollarSign, "Preço do Plano", crmCompany?.Plan_Price)}
                    {renderField(Calendar, "Expiração do Plano", crmCompany?.Plan_Expiration_Date)}
                    {renderField(CheckCircle, "Plano Ativo", crmCompany?.Plan_Active)}
                    {renderField(Repeat, "Renovação Automática", crmCompany?.Plan_Auto_Renewal)}
                    {renderField(TrendingUp, "Bumps Atuais", crmCompany?.Current_Bumps)}
                    {renderField(TrendingUp, "Bumps Totais", crmCompany?.Total_Bumps)}
                    {renderField(Banknote, "Mediador de Crédito", company["Mediador de credito"])}
                    {renderField(LinkIcon, "Link Banco de Portugal", company["Link do Banco de Portugal"])}
                    {renderField(ShieldCheck, "Financeiras com Acordo", company["Financeiras com acordo"])}
                    {renderField(Car, "Simulador Financiamento", crmCompany?.Financing_Simulator_On)}
                    {renderField(Car, "Cor do Simulador", crmCompany?.Simulator_Color)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="marketing-competition" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
                      Marketing e Concorrência
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Tag, "Classificação", company["Classificação"])}
                    {renderField(TrendingUp, "Percentagem de Importados", company["Percentagem de Importados"])}
                    {renderField(Car, "Onde compra as viaturas", company["Onde compra as viaturas"])}
                    {renderField(Users, "Concorrência", company["Concorrencia"])}
                    {renderField(DollarSign, "Investimento Redes Sociais", company["Investimento redes sociais"])}
                    {renderField(DollarSign, "Investimento em Portais", company["Investimento em portais"])}
                    {renderField(Building, "Mercado B2B", company["Mercado b2b"])}
                    {renderField(ShieldCheck, "Utiliza CRM", company["Utiliza CRM"])}
                    {renderField(Info, "Qual o CRM", company["Qual o CRM"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="partnerships-other" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <ShieldCheck className="mr-2 h-5 w-5 text-muted-foreground" />
                      Parcerias e Outros
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(CheckCircle, "Parceiro Credibom (CRM)", crmCompany?.Is_CRB_Partner)}
                    {renderField(CheckCircle, "Parceiro APDCA (CRM)", crmCompany?.Is_APDCA_Partner)}
                    {renderField(ShieldCheck, "Quer CT", company["Quer CT"])}
                    {renderField(ShieldCheck, "Quer ser Parceiro Credibom (Adicional)", company["Quer ser parceiro Credibom"])}
                    {renderField(Info, "Autobiz", company["Autobiz"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="important-dates" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                      Datas Importantes
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Calendar, "Data de Criação (CRM)", crmCompany?.Creation_Date)}
                    {renderField(Clock, "Último Login (CRM)", crmCompany?.Last_Login_Date)}
                    {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
            <TabsContent value="employees" className="mt-4"> {/* New Tab Content */}
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