"use client";

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Building, Landmark, Mail, Globe, Car, Factory, Tag, MapPin, User, Briefcase, Package, Info, DollarSign, Wallet, Calendar, Repeat, TrendingUp, Banknote, LinkIcon, ShieldCheck, Users, Clock, CheckCircle } from 'lucide-react';
import { CompanyAdditionalExcelData, Company as CrmCompanyType } from '@/types/crm';
import { renderField } from '@/utils/renderField'; // Import the utility renderField

interface CompanyDetailAccordionsProps {
  company: CompanyAdditionalExcelData;
  crmCompany: CrmCompanyType | undefined;
}

const CompanyDetailAccordions: React.FC<CompanyDetailAccordionsProps> = ({ company, crmCompany }) => {
  return (
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
    </Box>
  );
};

export default CompanyDetailAccordions;