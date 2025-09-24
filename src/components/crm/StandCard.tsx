"use client";

import React from 'react';
import { Stand } from '@/types/crm';
import { Separator } from '@/components/ui/separator'; // Keep Separator for now
import { MapPin, Phone, Mail, User, Building, Megaphone, Code, Upload, Archive, Save, TrendingUp, Tag, MessageSquareText, Clock, XOctagon, DollarSign } from 'lucide-react';

import MuiCard from '@mui/material/Card'; // Import MUI Card
import MuiCardContent from '@mui/material/CardContent'; // Import MUI CardContent
import MuiCardHeader from '@mui/material/CardHeader'; // Import MUI CardHeader
import Typography from '@mui/material/Typography'; // Import MUI Typography
import Box from '@mui/material/Box'; // Import MUI Box for layout

interface StandCardProps {
  stand: Stand;
}

const StandCard: React.FC<StandCardProps> = ({ stand }) => {
  const renderDetail = (Icon: React.ElementType, label: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '' || value === 0) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <Typography component="span" sx={{ fontWeight: 'medium' }}>{label}:</Typography> <Typography component="span" sx={{ ml: 0.5, color: 'text.primary' }}>{value}</Typography>
      </Box>
    );
  };

  return (
    <MuiCard sx={{ width: '100%', boxShadow: 1, '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.3s' }}>
      <MuiCardHeader
        title={<Typography variant="h6" component="div" sx={{ fontWeight: 'semibold' }}>{stand.Stand_ID}</Typography>}
        sx={{ pb: 1 }}
      />
      <MuiCardContent sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {renderDetail(Building, "Nome do Stand", stand.Stand_Name || stand.Company_Name)}
        {renderDetail(MapPin, "Morada", `${stand.Address}, ${stand.Postal_Code} ${stand.City}`)}
        {renderDetail(Phone, "Telefone", stand.Phone)}
        {renderDetail(Mail, "Email", stand.Email)}
        {renderDetail(User, "Pessoa de Contacto", stand.Contact_Person)}
        {renderDetail(Tag, "Tipo", stand.Tipo)}
        {renderDetail(MessageSquareText, "WhatsApp", stand.Whatsapp)}
        
        <Separator className="my-3" />
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
          {renderDetail(Megaphone, "Anúncios", stand.Anuncios)}
          {renderDetail(Code, "API", stand.API)}
          {renderDetail(Upload, "Publicados", stand.Publicados)}
          {renderDetail(Archive, "Arquivados", stand.Arquivados)}
          {renderDetail(Save, "Guardados", stand.Guardados)}
          {renderDetail(TrendingUp, "Δ Mês Passado", stand.Delta_Publicados_Last_Day_Month)}
          {renderDetail(MessageSquareText, "Leads Recebidas", stand.Leads_Recebidas)}
          {renderDetail(Clock, "Leads Pendentes", stand.Leads_Pendentes)}
          {renderDetail(XOctagon, "Leads Expiradas", stand.Leads_Expiradas)}
          {renderDetail(DollarSign, "Leads Financiadas", stand.Leads_Financiadas)}
        </Box>
      </MuiCardContent>
    </MuiCard>
  );
};

export default StandCard;