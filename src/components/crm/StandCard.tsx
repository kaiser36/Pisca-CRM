"use client";

import React from 'react';
import { Stand } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, User, Building, Megaphone, Code, Upload, Archive, Save, TrendingUp, Tag, MessageSquareText, Clock, XOctagon, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface StandCardProps {
  stand: Stand;
}

const StandCard: React.FC<StandCardProps> = ({ stand }) => {
  const renderDetail = (Icon: React.ElementType, label: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '' || value === 0) return null;
    return (
      <div className="flex items-center text-sm">
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}:</span> <span className="ml-1 text-foreground">{value}</span>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{stand.Stand_ID}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {renderDetail(Building, "Nome do Stand", stand.Company_Name)} {/* Changed label to "Nome do Stand" */}
        {renderDetail(MapPin, "Morada", `${stand.Address}, ${stand.Postal_Code} ${stand.City}`)}
        {renderDetail(Phone, "Telefone", stand.Phone)}
        {renderDetail(Mail, "Email", stand.Email)}
        {renderDetail(User, "Pessoa de Contacto", stand.Contact_Person)}
        {renderDetail(Tag, "Tipo", stand.Tipo)}
        {renderDetail(MessageSquareText, "WhatsApp", stand.Whatsapp)}
        
        <Separator className="my-3" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default StandCard;