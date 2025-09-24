"use client";

import React, { useState } from 'react';
import { CompanyAdditionalExcelData, Negocio } from '@/types/crm';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MapPin, Building, Globe, DollarSign, Package, Repeat, TrendingUp, Car, CheckCircle, XCircle, Calendar, User, Phone, Tag, Info, Banknote, LinkIcon, Clock, Users, Factory, ShieldCheck, Pencil, Landmark, Briefcase, PlusCircle, MessageSquareMore, Eye, Wallet, BellRing, Handshake, UserPlus, Upload, Archive, Save, ArrowRight, Download, Hourglass, XCircle as ExpiredIcon } from 'lucide-react';
import StandCard from '@/components/crm/StandCard';
import AccountContactCreateForm from './AccountContactCreateForm';
import AccountContactList from './AccountContactList';
import EasyvistaCreateForm from './EasyvistaCreateForm';
import EasyvistaList from './EasyvistaList';
import DealCreateForm from './DealCreateForm';
import DealList from './DealList';
import EmployeeCreateForm from './EmployeeCreateForm';
import EmployeeList from './EmployeeList';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isPast, parseISO, differenceInMonths, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { fetchDealsByCompanyExcelId } from '@/integrations/supabase/utils';
import { showError } from '@/utils/toast';

// Material UI Imports
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MuiButton from '@mui/material/Button';
import MuiAvatar from '@mui/material/Avatar';
import MuiBadge from '@mui/material/Badge';
import MuiDialog from '@mui/material/Dialog'; // MUI Dialog
import MuiDialogTitle from '@mui/material/DialogTitle'; // MUI DialogTitle
import MuiDialogContent from '@mui/material/DialogContent'; // MUI DialogContent
import MuiDialogActions from '@mui/material/DialogActions'; // MUI DialogActions
import MuiTabs from '@mui/material/Tabs'; // MUI Tabs
import MuiTab from '@mui/material/Tab'; // MUI Tab

// Import CompanyAdditionalEditForm
import CompanyAdditionalEditForm from './CompanyAdditionalEditForm';

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
  const [selectedTab, setSelectedTab] = useState(0); // State for MUI Tabs

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary',
          p: 2,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        Selecione uma empresa para ver os detalhes adicionais.
      </Box>
    );
  }

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !label.includes('Plafond') && !label.includes('Preço') && !label.includes('Bumps') && !label.includes('Investimento') && !label.includes('Stock') && !label.includes('Percentagem'))) return null;

    let displayValue: React.ReactNode = value;
    if (typeof value === 'boolean') {
      displayValue = value ? (
        <MuiBadge sx={{ bgcolor: 'success.light', color: 'success.dark', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem' }}>Sim</MuiBadge>
      ) : (
        <MuiBadge sx={{ bgcolor: 'error.light', color: 'error.dark', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem' }}>Não</MuiBadge>
      );
    } else if (typeof value === 'number') {
      displayValue = value.toLocaleString('pt-PT');
    } else if (label.includes('Link') || label.includes('Site') || label.includes('Logotipo')) {
      displayValue = (
        <a href={String(value)} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
        <Icon className="mr-2 h-4 w-4" style={{ color: 'text.secondary' }} />
        <Typography component="span" sx={{ fontWeight: 'medium', color: 'text.primary' }}>{label}:</Typography> <Typography component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>{displayValue}</Typography>
      </Box>
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
      <MuiCard sx={{ width: '100%', boxShadow: 3 }}>
        <MuiCardHeader
          title={
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{companyDisplayName}</Typography>
                {isCompanyClosed && (
                  <MuiBadge sx={{ bgcolor: 'error.main', color: 'white', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.875rem' }}>Empresa Encerrada</MuiBadge>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <MuiButton variant="outlined" size="small" startIcon={<PlusCircle className="h-4 w-4" />} onClick={() => setIsCreateContactDialogOpen(true)}>
                  Novo Contacto
                </MuiButton>
                <MuiDialog open={isCreateContactDialogOpen} onClose={() => setIsCreateContactDialogOpen(false)}>
                  <MuiDialogTitle>Adicionar Novo Contacto de Conta</MuiDialogTitle>
                  <MuiDialogContent>
                    <AccountContactCreateForm
                      companyExcelId={company.excel_company_id}
                      commercialName={company["Nome Comercial"]}
                      companyName={company.crmCompany?.Company_Name || company["Nome Comercial"]}
                      onSave={() => setIsCreateContactDialogOpen(false)}
                      onCancel={() => setIsCreateContactDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>

                <MuiButton variant="outlined" size="small" startIcon={<Eye className="h-4 w-4" />} onClick={() => setIsCreateEasyvistaDialogOpen(true)}>
                  Novo Easyvista
                </MuiButton>
                <MuiDialog open={isCreateEasyvistaDialogOpen} onClose={() => setIsCreateEasyvistaDialogOpen(false)}>
                  <MuiDialogTitle>Criar Novo Registo Easyvista</MuiDialogTitle>
                  <MuiDialogContent>
                    <EasyvistaCreateForm
                      companyExcelId={company.excel_company_id}
                      commercialName={company["Nome Comercial"]}
                      onSave={() => setIsCreateEasyvistaDialogOpen(false)}
                      onCancel={() => setIsCreateEasyvistaDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>

                <MuiButton variant="outlined" size="small" startIcon={<Handshake className="h-4 w-4" />} onClick={() => setIsCreateDealDialogOpen(true)}>
                  Novo Negócio
                </MuiButton>
                <MuiDialog open={isCreateDealDialogOpen} onClose={() => setIsCreateDealDialogOpen(false)}>
                  <MuiDialogTitle>Criar Novo Negócio</MuiDialogTitle>
                  <MuiDialogContent>
                    <DealCreateForm
                      companyExcelId={company.excel_company_id}
                      commercialName={company["Nome Comercial"] || company.crmCompany?.Commercial_Name}
                      onSave={() => setIsCreateDealDialogOpen(false)}
                      onCancel={() => setIsCreateDealDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>

                <MuiButton variant="outlined" size="small" startIcon={<UserPlus className="h-4 w-4" />} onClick={() => setIsCreateEmployeeDialogOpen(true)}>
                  Novo Colaborador
                </MuiButton>
                <MuiDialog open={isCreateEmployeeDialogOpen} onClose={() => setIsCreateEmployeeDialogOpen(false)}>
                  <MuiDialogTitle>Adicionar Novo Colaborador</MuiDialogTitle>
                  <MuiDialogContent>
                    <EmployeeCreateForm
                      companyExcelId={company.excel_company_id}
                      commercialName={company["Nome Comercial"] || company.crmCompany?.Commercial_Name}
                      onSave={() => setIsCreateEmployeeDialogOpen(false)}
                      onCancel={() => setIsCreateEmployeeDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>

                <MuiButton variant="outlined" size="small" startIcon={<Pencil className="h-4 w-4" />} onClick={() => setIsEditDialogOpen(true)}>
                  Editar
                </MuiButton>
                <MuiDialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
                  <MuiDialogTitle>Editar Dados Adicionais da Empresa</MuiDialogTitle>
                  <MuiDialogContent>
                    <CompanyAdditionalEditForm
                      company={company}
                      onSave={() => {
                        setIsEditDialogOpen(false);
                        onDataUpdated();
                      }}
                      onCancel={() => setIsEditDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>
              </Box>
            </Box>
          }
          subheader={`ID Excel: ${company.excel_company_id}`}
          subheaderTypographyProps={{ color: 'text.secondary' }}
          sx={{ pb: 1.5 }}
        />
        <MuiCardContent sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Main Overview Card - Converted to MUI Card */}
          <MuiCard sx={{ p: 3, boxShadow: 1, borderLeft: 4, borderColor: 'primary.main' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm="auto">
                <MuiAvatar
                  src={company["Logotipo"] || undefined}
                  alt={companyDisplayName}
                  sx={{ width: 64, height: 64, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '2rem', fontWeight: 'bold' }}
                >
                  {firstLetter}
                </MuiAvatar>
              </Grid>
              <Grid item xs={12} sm> {/* Corrected Grid item usage */}
                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}> {/* Corrected Grid item usage */}
                    {renderField(Mail, "Email", company["Email da empresa"] || crmCompany?.Company_Email)}
                  </Grid>
                  <Grid item xs={12} md={6}> {/* Corrected Grid item usage */}
                    {renderField(Globe, "Website", company["Site"] || crmCompany?.Website)}
                  </Grid>
                  <Grid item xs={12} md={6}> {/* Corrected Grid item usage */}
                    {renderField(Landmark, "NIF", crmCompany?.NIF)}
                  </Grid>
                  <Grid item xs={12} md={6}> {/* Corrected Grid item usage */}
                    {renderField(User, "AM Atual", company["AM"] || crmCompany?.AM_Current)}
                  </Grid>
                  {/* Aggregated Stand Data - Anúncios Pipeline */}
                  <Grid item xs={12}> {/* Corrected Grid item usage */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, fontSize: '0.875rem', mt: 1 }}>
                      <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                        <Upload className="mr-1 h-4 w-4" style={{ color: 'text.secondary' }} /> Publicados: <Typography component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>{totalPublicados}</Typography>
                      </Typography>
                      <ArrowRight className="h-4 w-4" style={{ color: 'text.secondary' }} />
                      <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                        <Archive className="mr-1 h-4 w-4" style={{ color: 'text.secondary' }} /> Arquivados: <Typography component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>{totalArquivados}</Typography>
                      </Typography>
                      <ArrowRight className="h-4 w-4" style={{ color: 'text.secondary' }} />
                      <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                        <Save className="mr-1 h-4 w-4" style={{ color: 'text.secondary' }} /> Guardados: <Typography component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>{totalGuardados}</Typography>
                      </Typography>
                    </Box>
                  </Grid>
                  {/* Aggregated Stand Data - Leads Pipeline */}
                  <Grid item xs={12}> {/* Corrected Grid item usage */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, fontSize: '0.875rem', mt: 1 }}>
                      <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'info.main' }}>
                        <Download className="mr-1 h-4 w-4" style={{ color: 'info.main' }} /> Leads Recebidas: <Typography component="span" sx={{ ml: 0.5, color: 'info.main' }}>{totalLeadsRecebidas}</Typography>
                      </Typography>
                      <ArrowRight className="h-4 w-4" style={{ color: 'text.secondary' }} />
                      <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                        <Hourglass className="mr-1 h-4 w-4" style={{ color: 'warning.main' }} /> Leads Pendentes: <Typography component="span" sx={{ ml: 0.5, color: 'warning.main' }}>{totalLeadsPendentes}</Typography>
                      </Typography>
                      <ArrowRight className="h-4 w-4" style={{ color: 'text.secondary' }} />
                      <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'error.main' }}>
                        <ExpiredIcon className="mr-1 h-4 w-4" style={{ color: 'error.main' }} /> Leads Expiradas: <Typography component="span" sx={{ ml: 0.5, color: 'error.main' }}>{totalLeadsExpiradas}</Typography>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MuiCard>
          {/* End Main Overview Card */}

          {/* New Overview Cards */}
          <Grid container spacing={2}>
            {/* Pisca Card */}
            <Grid item xs={12} md={4}> {/* Corrected Grid item usage */}
              <MuiCard sx={{ p: 2, boxShadow: 1, borderLeft: 4, borderColor: 'info.light', bgcolor: 'info.lightest' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 1.5, display: 'flex', alignItems: 'center', color: 'info.dark' }}>
                  <Package className="mr-2 h-5 w-5" /> Pisca
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {renderField(Package, "Último Plano", company["Plano Indicado"] || crmCompany?.Last_Plan)}
                  {renderField(CheckCircle, "Plano Ativo", crmCompany?.Plan_Active)}
                  {renderField(Calendar, "Expiração do Plano", crmCompany?.Plan_Expiration_Date)}
                  {renderField(Repeat, "Renovação Automática", crmCompany?.Plan_Auto_Renewal)}
                  {renderField(TrendingUp, "Bumps Totais", crmCompany?.Total_Bumps)}
                  {renderField(TrendingUp, "Bumps Atuais", crmCompany?.Current_Bumps)}
                  {renderField(Wallet, "Plafond", crmCompany?.Plafond)}
                </Box>
              </MuiCard>
            </Grid>

            {/* Resumo Card */}
            <Grid item xs={12} md={4}> {/* Corrected Grid item usage */}
              <MuiCard sx={{ p: 2, boxShadow: 1, borderLeft: 4, borderColor: 'success.light', bgcolor: 'success.lightest' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 1.5, display: 'flex', alignItems: 'center', color: 'success.dark' }}>
                  <Info className="mr-2 h-5 w-5" /> Resumo
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {renderField(Tag, "Classificação", company["Classificação"])}
                  {renderField(CheckCircle, "Parceiro Credibom", crmCompany?.Is_CRB_Partner)}
                  {renderField(Car, "Simulador Financiamento", crmCompany?.Financing_Simulator_On)}
                  {renderField(Clock, "Último Login", crmCompany?.Last_Login_Date)}
                  {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                </Box>
              </MuiCard>
            </Grid>

            {/* Alertas Card */}
            <Grid item xs={12} md={4}> {/* Corrected Grid item usage */}
              <MuiCard sx={{ p: 2, boxShadow: 1, borderLeft: 4, borderColor: alerts.length > 0 ? 'error.light' : 'warning.light', bgcolor: alerts.length > 0 ? 'error.lightest' : 'warning.lightest' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 1.5, display: 'flex', alignItems: 'center', color: alerts.length > 0 ? 'error.dark' : 'warning.dark' }}>
                  <BellRing className="mr-2 h-5 w-5" /> Alertas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                </Box>
              </MuiCard>
            </Grid>
          </Grid>
          {/* End New Overview Cards */}

          <MuiTabs value={selectedTab} onChange={(event, newValue) => setSelectedTab(newValue)} aria-label="company details tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <MuiTab label="Detalhes" />
            <MuiTab label="Stands" />
            <MuiTab label="Contactos" />
            <MuiTab label="Easyvistas" />
            <MuiTab label="Negócios" />
            <MuiTab label="Colaboradores" />
          </MuiTabs>

          {selectedTab === 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Accordion type="multiple" className="w-full space-y-4">
                <AccordionItem value="essential-info" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Info className="mr-2 h-5 w-5 text-muted-foreground" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Informações Essenciais da Empresa</Typography>
                    </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Localização e Morada</Typography>
                    </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <User className="mr-2 h-5 w-5 text-muted-foreground" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Gestão de Conta (AM)</Typography>
                    </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Package className="mr-2 h-5 w-5 text-muted-foreground" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Dados de Stock e API</Typography>
                    </Box>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Package, "Stock STV", company["Stock STV"] || crmCompany?.Stock_STV)}
                    {renderField(Package, "Stock na Empresa", company["Stock na empresa"] || crmCompany?.Company_Stock)}
                    {renderField(Info, "API Info", company["API"] || crmCompany?.Company_API_Info)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="plan-financing" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Detalhes do Plano e Financiamento</Typography>
                    </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Marketing e Concorrência</Typography>
                    </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShieldCheck className="mr-2 h-5 w-5 text-muted-foreground" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Parcerias e Outros</Typography>
                    </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Datas Importantes</Typography>
                    </Box>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Calendar, "Data de Criação (CRM)", crmCompany?.Creation_Date)}
                    {renderField(Clock, "Último Login (CRM)", crmCompany?.Last_Login_Date)}
                    {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Separator className="my-6" />
              <Typography variant="caption" color="text.secondary">
                Criado em: {company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          )}

          {selectedTab === 1 && (
            <Box sx={{ mt: 2 }}>
              {crmCompany && crmCompany.stands && crmCompany.stands.length > 0 ? (
                <Grid container spacing={2}>
                  {crmCompany.stands.map((stand) => (
                    <Grid item xs={12} md={6} lg={4} key={stand.Stand_ID}> {/* Corrected Grid item usage */}
                      <StandCard stand={stand} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Nenhum stand associado encontrado no CRM principal.</Typography>
              )}
            </Box>
          )}

          {selectedTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <MessageSquareMore className="mr-2 h-5 w-5" /> Histórico de Contactos
              </Typography>
              <AccountContactList companyExcelId={company.excel_company_id} />
            </Box>
          )}

          {selectedTab === 3 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <Eye className="mr-2 h-5 w-5" /> Registos Easyvista
              </Typography>
              <EasyvistaList companyExcelId={company.excel_company_id} />
            </Box>
          )}

          {selectedTab === 4 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <Handshake className="mr-2 h-5 w-5" /> Negócios
              </Typography>
              <DealList companyExcelId={company.excel_company_id} />
            </Box>
          )}

          {selectedTab === 5 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <Users className="mr-2 h-5 w-5" /> Colaboradores
              </Typography>
              <EmployeeList companyExcelId={company.excel_company_id} onEmployeeChanged={onDataUpdated} />
            </Box>
          )}
        </MuiCardContent>
      </MuiCard>
    </ScrollArea>
  );
};

export default CompanyAdditionalDetailCard;