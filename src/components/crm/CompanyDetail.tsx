import React from 'react';
import { Company } from '@/types/crm';
import StandCard from './StandCard';
import { Separator } from '@/components/ui/separator'; // Keep Separator for now
import { ScrollArea } from '@/components/ui/scroll-area'; // Keep ScrollArea for now
import { Mail, User, Building, Landmark, Globe, Wallet, Briefcase, CheckCircle, XCircle, Calendar, Clock, DollarSign, Package, Repeat, TrendingUp, Car, ArrowLeft } from 'lucide-react';

import MuiCard from '@mui/material/Card'; // Import MUI Card
import MuiCardContent from '@mui/material/CardContent'; // Import MUI CardContent
import MuiCardHeader from '@mui/material/CardHeader'; // Import MUI CardHeader
import Typography from '@mui/material/Typography'; // Import MUI Typography
import Box from '@mui/material/Box'; // Import MUI Box for layout
import MuiButton from '@mui/material/Button'; // Import MUI Button
import IconButton from '@mui/material/IconButton'; // Import MUI IconButton

interface CompanyDetailProps {
  company: Company | null;
  onBack?: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onBack }) => {
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
        Selecione uma empresa para ver os detalhes.
      </Box>
    );
  }

  const formatDateWithTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString('pt-PT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const renderDetail = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !label.includes('Plafond') && !label.includes('Preço') && !label.includes('Bumps'))) return null;

    let displayValue: React.ReactNode = value;
    if (typeof value === 'boolean') {
      displayValue = value ? (
        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>Sim</Typography>
      ) : (
        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>Não</Typography>
      );
    } else if (label.includes('Data')) {
      displayValue = formatDateWithTime(String(value));
    } else if (label.includes('Plafond') || label.includes('Preço')) {
      displayValue = `${Number(value).toFixed(2)} €`;
    } else if (label.includes('Website')) {
      displayValue = (
        <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {String(value)}
        </a>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <Typography component="span" sx={{ fontWeight: 'medium' }}>{label}:</Typography> <Typography component="span" sx={{ ml: 0.5, color: 'text.primary' }}>{displayValue}</Typography>
      </Box>
    );
  };

  return (
    <ScrollArea className="h-full w-full pr-4">
      <MuiCard sx={{ width: '100%', boxShadow: 3 }}>
        <MuiCardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{company.Company_Name}</Typography>
              {onBack && (
                <IconButton onClick={onBack} sx={{ display: { lg: 'none' } }}>
                  <ArrowLeft className="h-5 w-5" />
                </IconButton>
              )}
            </Box>
          }
          subheader={`ID da Empresa: ${company.Company_id}`}
          subheaderTypographyProps={{ color: 'text.secondary' }}
          sx={{ pb: 1.5 }}
        />
        <MuiCardContent sx={{ pt: 0, spaceY: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {renderDetail(Landmark, "NIF", company.NIF)}
            {renderDetail(Mail, "Email da Empresa", company.Company_Email)}
            {renderDetail(User, "Pessoa de Contacto", company.Company_Contact_Person)}
            {renderDetail(Globe, "Website", company.Website)}
            {renderDetail(Wallet, "Plafond", company.Plafond)}
            {renderDetail(Briefcase, "Supervisor", company.Supervisor)}
            {renderDetail(CheckCircle, "Parceiro Credibom", company.Is_CRB_Partner)}
            {renderDetail(CheckCircle, "APDCA", company.Is_APDCA_Partner)}
            {renderDetail(Calendar, "Criação da Conta", company.Creation_Date)}
            {renderDetail(Clock, "Último Login", company.Last_Login_Date)}
            {renderDetail(CheckCircle, "Simulador Financiamento", company.Financing_Simulator_On)}
            {renderDetail(Car, "Cor do Simulador", company.Simulator_Color)}
            {renderDetail(Package, "Último Plano", company.Last_Plan)}
            {renderDetail(DollarSign, "Preço do Plano", company.Plan_Price)}
            {renderDetail(Calendar, "Expiração do Plano", company.Plan_Expiration_Date)}
            {renderDetail(CheckCircle, "Plano Ativo", company.Plan_Active)}
            {renderDetail(Repeat, "Renovação Automática", company.Plan_Auto_Renewal)}
            {renderDetail(TrendingUp, "Bumps Atuais", company.Current_Bumps)}
            {renderDetail(TrendingUp, "Bumps Totais", company.Total_Bumps)}
          </Box>
          
          {company.stands.length > 0 && (
            <>
              <Separator className="my-4" />
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'semibold', mb: 2 }}>Pontos de Venda ({company.stands.length})</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
                {company.stands.map((stand) => (
                  <StandCard key={stand.Stand_ID} stand={stand} />
                ))}
              </Box>
            </>
          )}
        </MuiCardContent>
      </MuiCard>
    </ScrollArea>
  );
};

export default CompanyDetail;