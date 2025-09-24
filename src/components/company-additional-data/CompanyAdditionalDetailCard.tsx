"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { CompanyAdditionalExcelData, Negocio } from '@/types/crm';
import StandCard from '@/components/crm/StandCard';
import AccountContactCreateForm from './AccountContactCreateForm';
import AccountContactList from './AccountContactList';
import EasyvistaCreateForm from './EasyvistaCreateForm';
import EasyvistaList from './EasyvistaList';
import DealCreateForm from './DealCreateForm';
import DealList from './DealList';
import EmployeeCreateForm from './EmployeeCreateForm';
import EmployeeList from './EmployeeList';
import CompanyAdditionalEditForm from './CompanyAdditionalEditForm'; // Adicionado: Importação em falta
import { Separator } from '@/components/ui/separator'; // Keep Separator for now
import { ScrollArea } from '@/components/ui/scroll-area'; // Keep ScrollArea for now
import { Mail, MapPin, Building, Globe, DollarSign, Package, Repeat, TrendingUp, Car, CheckCircle, XCircle, Calendar, User, Phone, Tag, Info, Banknote, LinkIcon, Clock, Users, Factory, ShieldCheck, Pencil, Landmark, Briefcase, PlusCircle, MessageSquareMore, Eye, Wallet, BellRing, Handshake, UserPlus, Upload, Archive, Save, ArrowRight, Download, Hourglass, XCircle as ExpiredIcon } from 'lucide-react';
import { isPast, parseISO, differenceInMonths, differenceInDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { fetchDealsByCompanyExcelId } from '@/integrations/supabase/utils';
import { showError } from '@/utils/toast';

// Material UI Imports
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MuiButton from '@mui/material/Button';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAvatar from '@mui/material/Avatar';
import MuiBadge from '@mui/material/Badge';
import MuiAlert from '@mui/material/Alert';
import MuiAlertTitle from '@mui/material/AlertTitle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // MUI icon for accordion

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
  const [currentTab, setCurrentTab] = useState(0); // For MUI Tabs

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
        <MuiBadge color="success" variant="dot" sx={{ '& .MuiBadge-dot': { height: 10, width: 10, borderRadius: '50%' } }}>
          <Typography component="span" sx={{ color: 'success.main', ml: 1 }}>Sim</Typography>
        </MuiBadge>
      ) : (
        <MuiBadge color="error" variant="dot" sx={{ '& .MuiBadge-dot': { height: 10, width: 10, borderRadius: '50%' } }}>
          <Typography component="span" sx={{ color: 'error.main', ml: 1 }}>Não</Typography>
        </MuiBadge>
      );
    } else if (typeof value === 'number') {
      displayValue = value.toLocaleString('pt-PT');
    } else if (label.includes('Link') || label.includes('Site') || label.includes('Logotipo')) {
      displayValue = (
        <a href={String(value)} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
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
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <Typography component="span" sx={{ fontWeight: 'medium' }}>{label}:</Typography> <Typography component="span" sx={{ ml: 0.5, color: 'text.primary' }}>{displayValue}</Typography>
      </Box>
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

  const isLoginOld = (dateString: string): boolean => {
    try {
      const date = parseISO(dateString);
      return differenceInDays(new Date(), date) >= 7;
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
  if (!crmCompany?.Plan_Active) {
    alerts.push("O plano da empresa não está ativo!");
  }

  // 3. Se a data da ultima visita for mais de 3 meses
  const lastVisitDate = company["Data ultima visita"] || crmCompany?.Last_Visit_Date || null;
  if (lastVisitDate && isVisitOld(lastVisitDate)) {
    alerts.push("A última visita foi há mais de 3 meses.");
  }

  // 4. Se o ultimo login foi à mais de uma semana atras
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ScrollArea className="h-full w-full pr-4">
      <MuiCard sx={{ width: '100%', boxShadow: 3 }}>
        <MuiCardHeader
          title={
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{companyDisplayName}</Typography>
                {isCompanyClosed && (
                  <MuiBadge color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', px: 1, py: 0.5, borderRadius: 1 } }}>
                    Empresa Encerrada
                  </MuiBadge>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <MuiButton variant="outlined" size="small" onClick={() => setIsCreateContactDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Novo Contacto
                </MuiButton>
                <MuiDialog open={isCreateContactDialogOpen} onClose={() => setIsCreateContactDialogOpen(false)} maxWidth="md" fullWidth>
                  <MuiDialogTitle>Adicionar Novo Contacto de Conta</MuiDialogTitle>
                  <MuiDialogContent dividers>
                    <AccountContactCreateForm
                      companyExcelId={company.excel_company_id}
                      commercialName={company["Nome Comercial"]}
                      companyName={company.crmCompany?.Company_Name || company["Nome Comercial"]}
                      onSave={() => setIsCreateContactDialogOpen(false)}
                      onCancel={() => setIsCreateContactDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>

                <MuiButton variant="outlined" size="small" onClick={() => setIsCreateEasyvistaDialogOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" /> Novo Easyvista
                </MuiButton>
                <MuiDialog open={isCreateEasyvistaDialogOpen} onClose={() => setIsCreateEasyvistaDialogOpen(false)} maxWidth="md" fullWidth>
                  <MuiDialogTitle>Criar Novo Registo Easyvista</MuiDialogTitle>
                  <MuiDialogContent dividers>
                    <EasyvistaCreateForm
                      companyExcelId={company.excel_company_id}
                      commercialName={company["Nome Comercial"]}
                      onSave={() => setIsCreateEasyvistaDialogOpen(false)}
                      onCancel={() => setIsCreateEasyvistaDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>

                <MuiButton variant="outlined" size="small" onClick={() => setIsCreateDealDialogOpen(true)}>
                  <Handshake className="mr-2 h-4 w-4" /> Novo Negócio
                </MuiButton>
                <MuiDialog open={isCreateDealDialogOpen} onClose={() => setIsCreateDealDialogOpen(false)} maxWidth="md" fullWidth>
                  <MuiDialogTitle>Criar Novo Negócio</MuiDialogTitle>
                  <MuiDialogContent dividers>
                    <DealCreateForm
                      companyExcelId={company.excel_company_id}
                      commercialName={company["Nome Comercial"] || company.crmCompany?.Commercial_Name}
                      onSave={() => setIsCreateDealDialogOpen(false)}
                      onCancel={() => setIsCreateDealDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>

                <MuiButton variant="outlined" size="small" onClick={() => setIsCreateEmployeeDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Novo Colaborador
                </MuiButton>
                <MuiDialog open={isCreateEmployeeDialogOpen} onClose={() => setIsCreateEmployeeDialogOpen(false)} maxWidth="md" fullWidth>
                  <MuiDialogTitle>Adicionar Novo Colaborador</MuiDialogTitle>
                  <MuiDialogContent dividers>
                    <EmployeeCreateForm
                      companyExcelId={company.excel_company_id}
                      commercialName={company["Nome Comercial"] || company.crmCompany?.Commercial_Name}
                      onSave={() => setIsCreateEmployeeDialogOpen(false)}
                      onCancel={() => setIsCreateEmployeeDialogOpen(false)}
                    />
                  </MuiDialogContent>
                </MuiDialog>

                <MuiButton variant="outlined" size="small" onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </MuiButton>
                <MuiDialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
                  <MuiDialogTitle>Editar Dados Adicionais da Empresa</MuiDialogTitle>
                  <MuiDialogContent dividers>
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
          {/* Main Overview Card */}
          <MuiCard sx={{ p: 3, boxShadow: 1, borderLeft: 4, borderColor: 'primary.main' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
              <MuiAvatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: '2rem', fontWeight: 'bold' }} src={company["Logotipo"] || undefined} alt={companyDisplayName}>
                {firstLetter}
              </MuiAvatar>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1, md: 2 }, flex: 1 }}>
                {renderField(Mail, "Email", company["Email da empresa"] || crmCompany?.Company_Email)}
                {renderField(Globe, "Website", company["Site"] || crmCompany?.Website)}
                {renderField(Landmark, "NIF", crmCompany?.NIF)}
                {renderField(User, "AM Atual", company["AM"] || crmCompany?.AM_Current)}
                {/* Aggregated Stand Data - Anúncios Pipeline */}
                <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', flexWrap: 'wrap', gap: 1, gridColumn: { xs: 'span 1', md: 'span 2' } }}>
                  <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <Upload className="mr-1 h-4 w-4 text-muted-foreground" /> Publicados: <Typography component="span" sx={{ ml: 0.5, color: 'text.primary' }}>{totalPublicados}</Typography>
                  </Typography>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <Archive className="mr-1 h-4 w-4 text-muted-foreground" /> Arquivados: <Typography component="span" sx={{ ml: 0.5, color: 'text.primary' }}>{totalArquivados}</Typography>
                  </Typography>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <Save className="mr-1 h-4 w-4 text-muted-foreground" /> Guardados: <Typography component="span" sx={{ ml: 0.5, color: 'text.primary' }}>{totalGuardados}</Typography>
                  </Typography>
                </Box>
                {/* Aggregated Stand Data - Leads Pipeline */}
                <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', flexWrap: 'wrap', gap: 1, gridColumn: { xs: 'span 1', md: 'span 2' }, mt: 1 }}>
                  <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'info.main' }}>
                    <Download className="mr-1 h-4 w-4" /> Leads Recebidas: <Typography component="span" sx={{ ml: 0.5 }}>{totalLeadsRecebidas}</Typography>
                  </Typography>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                    <Hourglass className="mr-1 h-4 w-4" /> Leads Pendentes: <Typography component="span" sx={{ ml: 0.5 }}>{totalLeadsPendentes}</Typography>
                  </Typography>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Typography component="span" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'error.main' }}>
                    <ExpiredIcon className="mr-1 h-4 w-4" /> Leads Expiradas: <Typography component="span" sx={{ ml: 0.5 }}>{totalLeadsExpiradas}</Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MuiCard>
          {/* End Main Overview Card */}

          {/* New Overview Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {/* Pisca Card */}
            <MuiCard sx={{ p: 2, boxShadow: 1, borderLeft: 4, borderColor: 'info.light', bgcolor: 'info.lighter' }}>
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

            {/* Resumo Card */}
            <MuiCard sx={{ p: 2, boxShadow: 1, borderLeft: 4, borderColor: 'success.light', bgcolor: 'success.lighter' }}>
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

            {/* Alertas Card */}
            <MuiCard sx={{ p: 2, boxShadow: 1, borderLeft: 4, borderColor: alerts.length > 0 ? 'error.light' : 'warning.light', bgcolor: alerts.length > 0 ? 'error.lighter' : 'warning.lighter' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 1.5, display: 'flex', alignItems: 'center', color: alerts.length > 0 ? 'error.dark' : 'warning.dark' }}>
                <BellRing className="mr-2 h-5 w-5" /> Alertas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {alerts.length === 0 ? (
                  <MuiAlert severity="success" sx={{ bgcolor: 'transparent', border: 'none', p: 0, color: 'success.dark' }}>
                    <MuiAlertTitle sx={{ display: 'flex', alignItems: 'center', m: 0 }}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Sem alertas pendentes.
                    </MuiAlertTitle>
                  </MuiAlert>
                ) : (
                  alerts.map((alert, index) => (
                    <MuiAlert key={index} severity="error" sx={{ bgcolor: 'error.light', border: 1, borderColor: 'error.main', color: 'error.dark', p: 1 }}>
                      <MuiAlertTitle sx={{ display: 'flex', alignItems: 'center', m: 0 }}>
                        <Info className="mr-2 h-4 w-4" /> {alert}
                      </MuiAlertTitle>
                    </MuiAlert>
                  ))
                )}
              </Box>
            </MuiCard>
          </Box>
          {/* End New Overview Cards */}

          <MuiTabs value={currentTab} onChange={handleTabChange} aria-label="company details tabs"
            variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}
          >
            <MuiTab label="Detalhes" />
            <MuiTab label="Stands" />
            <MuiTab label="Contactos" />
            <MuiTab label="Easyvistas" />
            <MuiTab label="Negócios" />
            <MuiTab label="Colaboradores" />
          </MuiTabs>

          {currentTab === 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <MuiAccordion defaultExpanded sx={{ boxShadow: 1, border: 1, borderColor: 'divider' }}>
                <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Info className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Informações Essenciais da Empresa</Typography>
                  </Box>
                </MuiAccordionSummary>
                <MuiAccordionDetails sx={{ pt: 1, pb: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {renderField(Building, "Nome Fiscal", crmCompany?.Company_Name)}
                  {renderField(Building, "Nome Comercial", company["Nome Comercial"])}
                  {renderField(Landmark, "NIF", crmCompany?.NIF)}
                  {renderField(Mail, "Email Principal", company["Email da empresa"] || crmCompany?.Company_Email)}
                  {renderField(Globe, "Website", company["Site"] || crmCompany?.Website)}
                  {renderField(Car, "Logotipo (URL)", company["Logotipo"])}
                  {renderField(Building, "Tipo de Empresa", company["Tipo de empresa"])}
                  {renderField(Factory, "Grupo", company["Grupo"])}
                  {renderField(Tag, "Marcas Representadas", company["Marcas representadas"])}
                </MuiAccordionDetails>
              </MuiAccordion>

              <MuiAccordion sx={{ boxShadow: 1, border: 1, borderColor: 'divider' }}>
                <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Localização e Morada</Typography>
                  </Box>
                </MuiAccordionSummary>
                <MuiAccordionDetails sx={{ pt: 1, pb: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {renderField(MapPin, "Morada", company["Morada"] || crmCompany?.Company_Address)}
                  {renderField(MapPin, "Código Postal", company["STAND_POSTAL_CODE"] || crmCompany?.Company_Postal_Code)}
                  {renderField(MapPin, "Distrito", company["Distrito"] || crmCompany?.District)}
                  {renderField(MapPin, "Cidade", company["Cidade"] || crmCompany?.Company_City)}
                </MuiAccordionDetails>
              </MuiAccordion>

              <MuiAccordion sx={{ boxShadow: 1, border: 1, borderColor: 'divider' }}>
                <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3a-content" id="panel3a-header">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <User className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Gestão de Conta (AM)</Typography>
                  </Box>
                </MuiAccordionSummary>
                <MuiAccordionDetails sx={{ pt: 1, pb: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {renderField(User, "Pessoa de Contacto (CRM)", crmCompany?.Company_Contact_Person)}
                  {renderField(Briefcase, "Supervisor (CRM)", crmCompany?.Supervisor)}
                  {renderField(User, "AM Antigo", company["AM_OLD"])}
                  {renderField(User, "AM Atual", company["AM"])}
                  {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                </MuiAccordionDetails>
              </MuiAccordion>

              <MuiAccordion sx={{ boxShadow: 1, border: 1, borderColor: 'divider' }}>
                <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4a-content" id="panel4a-header">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Package className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Dados de Stock e API</Typography>
                  </Box>
                </MuiAccordionSummary>
                <MuiAccordionDetails sx={{ pt: 1, pb: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {renderField(Package, "Stock STV", company["Stock STV"] || crmCompany?.Stock_STV)}
                  {renderField(Package, "Stock na Empresa", company["Stock na empresa"] || crmCompany?.Company_Stock)}
                  {renderField(Info, "API Info", company["API"] || crmCompany?.Company_API_Info)}
                </MuiAccordionDetails>
              </MuiAccordion>

              <MuiAccordion sx={{ boxShadow: 1, border: 1, borderColor: 'divider' }}>
                <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel5a-content" id="panel5a-header">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Detalhes do Plano e Financiamento</Typography>
                  </Box>
                </MuiAccordionSummary>
                <MuiAccordionDetails sx={{ pt: 1, pb: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
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
                </MuiAccordionDetails>
              </MuiAccordion>

              <MuiAccordion sx={{ boxShadow: 1, border: 1, borderColor: 'divider' }}>
                <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel6a-content" id="panel6a-header">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Marketing e Concorrência</Typography>
                  </Box>
                </MuiAccordionSummary>
                <MuiAccordionDetails sx={{ pt: 1, pb: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {renderField(Tag, "Classificação", company["Classificação"])}
                  {renderField(TrendingUp, "Percentagem de Importados", company["Percentagem de Importados"])}
                  {renderField(Car, "Onde compra as viaturas", company["Onde compra as viaturas"])}
                  {renderField(Users, "Concorrência", company["Concorrencia"])}
                  {renderField(DollarSign, "Investimento Redes Sociais", company["Investimento redes sociais"])}
                  {renderField(DollarSign, "Investimento em Portais", company["Investimento em portais"])}
                  {renderField(Building, "Mercado B2B", company["Mercado b2b"])}
                  {renderField(ShieldCheck, "Utiliza CRM", company["Utiliza CRM"])}
                  {renderField(Info, "Qual o CRM", company["Qual o CRM"])}
                </MuiAccordionDetails>
              </MuiAccordion>

              <MuiAccordion sx={{ boxShadow: 1, border: 1, borderColor: 'divider' }}>
                <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel7a-content" id="panel7a-header">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShieldCheck className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Parcerias e Outros</Typography>
                  </Box>
                </MuiAccordionSummary>
                <MuiAccordionDetails sx={{ pt: 1, pb: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {renderField(CheckCircle, "Parceiro Credibom (CRM)", crmCompany?.Is_CRB_Partner)}
                  {renderField(CheckCircle, "Parceiro APDCA (CRM)", crmCompany?.Is_APDCA_Partner)}
                  {renderField(ShieldCheck, "Quer CT", company["Quer CT"])}
                  {renderField(ShieldCheck, "Quer ser Parceiro Credibom (Adicional)", company["Quer ser parceiro Credibom"])}
                  {renderField(Info, "Autobiz", company["Autobiz"])}
                </MuiAccordionDetails>
              </MuiAccordion>

              <MuiAccordion sx={{ boxShadow: 1, border: 1, borderColor: 'divider' }}>
                <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel8a-content" id="panel8a-header">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Datas Importantes</Typography>
                  </Box>
                </MuiAccordionSummary>
                <MuiAccordionDetails sx={{ pt: 1, pb: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {renderField(Calendar, "Data de Criação (CRM)", crmCompany?.Creation_Date)}
                  {renderField(Clock, "Último Login (CRM)", crmCompany?.Last_Login_Date)}
                  {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                </MuiAccordionDetails>
              </MuiAccordion>
              <Separator className="my-6" />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Criado em: {company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          )}
          {currentTab === 1 && (
            <Box sx={{ mt: 2 }}>
              {crmCompany && crmCompany.stands && crmCompany.stands.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
                  {crmCompany.stands.map((stand) => (
                    <StandCard key={stand.Stand_ID} stand={stand} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Nenhum stand associado encontrado no CRM principal.</Typography>
              )}
            </Box>
          )}
          {currentTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <MessageSquareMore className="mr-2 h-5 w-5" /> Histórico de Contactos
              </Typography>
              <AccountContactList companyExcelId={company.excel_company_id} />
            </Box>
          )}
          {currentTab === 3 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <Eye className="mr-2 h-5 w-5" /> Registos Easyvista
              </Typography>
              <EasyvistaList companyExcelId={company.excel_company_id} />
            </Box>
          )}
          {currentTab === 4 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <Handshake className="mr-2 h-5 w-5" /> Negócios
              </Typography>
              <DealList companyExcelId={company.excel_company_id} />
            </Box>
          )}
          {currentTab === 5 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
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