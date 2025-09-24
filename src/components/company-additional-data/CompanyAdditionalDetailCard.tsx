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
import CompanyAdditionalEditForm from './CompanyAdditionalEditForm';
import CompanyAdditionalHeader from './CompanyAdditionalHeader'; // NEW
import CompanyOverviewCards from './CompanyOverviewCards'; // NEW
import CompanyDetailAccordions from './CompanyDetailAccordions'; // NEW
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { fetchDealsByCompanyExcelId } from '@/integrations/supabase/utils';
import { showError } from '@/utils/toast';
import { isPast, parseISO, format } from 'date-fns';
import { isVisitOld } from '@/utils/renderField'; // Import utility for date comparison

// Material UI Imports
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';

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

  const companyDisplayName = company["Nome Comercial"] || company.crmCompany?.Company_Name || "Empresa Desconhecida";
  const firstLetter = companyDisplayName.charAt(0).toUpperCase();

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
        <CompanyAdditionalHeader
          companyDisplayName={companyDisplayName}
          excelCompanyId={company.excel_company_id}
          isCompanyClosed={isCompanyClosed}
          onEditClick={() => setIsEditDialogOpen(true)}
          onCreateContactClick={() => setIsCreateContactDialogOpen(true)}
          onCreateEasyvistaClick={() => setIsCreateEasyvistaDialogOpen(true)}
          onCreateDealClick={() => setIsCreateDealDialogOpen(true)}
          onCreateEmployeeClick={() => setIsCreateEmployeeDialogOpen(true)}
        />

        <MuiCardContent sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <CompanyOverviewCards
            company={company}
            crmCompany={crmCompany}
            alerts={alerts}
            totalPublicados={totalPublicados}
            totalArquivados={totalArquivados}
            totalGuardados={totalGuardados}
            totalLeadsRecebidas={totalLeadsRecebidas}
            totalLeadsPendentes={totalLeadsPendentes}
            totalLeadsExpiradas={totalLeadsExpiradas}
            companyDisplayName={companyDisplayName}
            firstLetter={firstLetter}
          />

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
            <CompanyDetailAccordions company={company} crmCompany={crmCompany} />
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
                Histórico de Contactos
              </Typography>
              <AccountContactList companyExcelId={company.excel_company_id} />
            </Box>
          )}
          {currentTab === 3 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                Registos Easyvista
              </Typography>
              <EasyvistaList companyExcelId={company.excel_company_id} />
            </Box>
          )}
          {currentTab === 4 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                Negócios
              </Typography>
              <DealList companyExcelId={company.excel_company_id} />
            </Box>
          )}
          {currentTab === 5 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold', mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                Colaboradores
              </Typography>
              <EmployeeList companyExcelId={company.excel_company_id} onEmployeeChanged={onDataUpdated} />
            </Box>
          )}
          <Separator className="my-6" />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Criado em: {company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'}
          </Typography>
        </MuiCardContent>
      </MuiCard>

      {/* Dialogs for Create/Edit Forms (kept in parent for centralized state/data refresh) */}
      <MuiDialog open={isCreateContactDialogOpen} onClose={() => setIsCreateContactDialogOpen(false)} maxWidth="md" fullWidth>
        <MuiDialogTitle>Adicionar Novo Contacto de Conta</MuiDialogTitle>
        <MuiDialogContent dividers>
          <AccountContactCreateForm
            companyExcelId={company.excel_company_id}
            commercialName={company["Nome Comercial"]}
            companyName={company.crmCompany?.Company_Name || company["Nome Comercial"]}
            onSave={() => { setIsCreateContactDialogOpen(false); onDataUpdated(); }}
            onCancel={() => setIsCreateContactDialogOpen(false)}
          />
        </MuiDialogContent>
      </MuiDialog>

      <MuiDialog open={isCreateEasyvistaDialogOpen} onClose={() => setIsCreateEasyvistaDialogOpen(false)} maxWidth="md" fullWidth>
        <MuiDialogTitle>Criar Novo Registo Easyvista</MuiDialogTitle>
        <MuiDialogContent dividers>
          <EasyvistaCreateForm
            companyExcelId={company.excel_company_id}
            commercialName={company["Nome Comercial"]}
            onSave={() => { setIsCreateEasyvistaDialogOpen(false); onDataUpdated(); }}
            onCancel={() => setIsCreateEasyvistaDialogOpen(false)}
          />
        </MuiDialogContent>
      </MuiDialog>

      <MuiDialog open={isCreateDealDialogOpen} onClose={() => setIsCreateDealDialogOpen(false)} maxWidth="md" fullWidth>
        <MuiDialogTitle>Criar Novo Negócio</MuiDialogTitle>
        <MuiDialogContent dividers>
          <DealCreateForm
            companyExcelId={company.excel_company_id}
            commercialName={company["Nome Comercial"] || company.crmCompany?.Commercial_Name}
            onSave={() => { setIsCreateDealDialogOpen(false); onDataUpdated(); }}
            onCancel={() => setIsCreateDealDialogOpen(false)}
          />
        </MuiDialogContent>
      </MuiDialog>

      <MuiDialog open={isCreateEmployeeDialogOpen} onClose={() => setIsCreateEmployeeDialogOpen(false)} maxWidth="md" fullWidth>
        <MuiDialogTitle>Adicionar Novo Colaborador</MuiDialogTitle>
        <MuiDialogContent dividers>
          <EmployeeCreateForm
            companyExcelId={company.excel_company_id}
            commercialName={company["Nome Comercial"] || company.crmCompany?.Commercial_Name}
            onSave={() => { setIsCreateEmployeeDialogOpen(false); onDataUpdated(); }}
            onCancel={() => setIsCreateEmployeeDialogOpen(false)}
          />
        </MuiDialogContent>
      </MuiDialog>

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
    </ScrollArea>
  );
};

export default CompanyAdditionalDetailCard;