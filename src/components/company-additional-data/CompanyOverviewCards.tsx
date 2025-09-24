"use client";

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MuiCard from '@mui/material/Card';
import MuiAvatar from '@mui/material/Avatar';
import MuiAlert from '@mui/material/Alert';
import MuiAlertTitle from '@mui/material/AlertTitle';
import MuiBadge from '@mui/material/Badge';
import { Mail, Globe, Landmark, User, Package, ArrowRight, Archive, Save, Upload, Download, Hourglass, XCircle as ExpiredIcon, Info, CheckCircle, Car, Clock, Repeat, TrendingUp, Wallet, BellRing, Calendar } from 'lucide-react';
import { CompanyAdditionalExcelData, Company as CrmCompanyType } from '@/types/crm';
import { renderField } from '@/utils/renderField'; // Import the utility renderField

interface CompanyOverviewCardsProps {
  company: CompanyAdditionalExcelData;
  crmCompany: CrmCompanyType | undefined;
  alerts: string[];
  totalPublicados: number;
  totalArquivados: number;
  totalGuardados: number;
  totalLeadsRecebidas: number;
  totalLeadsPendentes: number;
  totalLeadsExpiradas: number;
  companyDisplayName: string;
  firstLetter: string;
}

const CompanyOverviewCards: React.FC<CompanyOverviewCardsProps> = ({
  company,
  crmCompany,
  alerts,
  totalPublicados,
  totalArquivados,
  totalGuardados,
  totalLeadsRecebidas,
  totalLeadsPendentes,
  totalLeadsExpiradas,
  companyDisplayName,
  firstLetter,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            {renderField(Info, "Classificação", company["Classificação"])}
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
    </Box>
  );
};

export default CompanyOverviewCards;