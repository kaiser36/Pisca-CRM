import React from 'react';
import { Stand } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, User, Building, Megaphone, Code, Upload, Archive, Save, TrendingUp, Tag, MessageSquareText, Clock, XOctagon, DollarSign } from 'lucide-react'; // Added MessageSquareText, Clock, XOctagon, DollarSign icons
import { Separator } from '@/components/ui/separator';

interface StandCardProps {
  stand: Stand;
}

const StandCard: React.FC<StandCardProps> = ({ stand }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{stand.Stand_ID}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center">
          <Building className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Company_Name}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Address}, {stand.Postal_Code} {stand.City}</span>
        </div>
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Phone}</span>
        </div>
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Email}</span>
        </div>
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Contact_Person}</span>
        </div>
        <div className="flex items-center">
          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Tipo: {stand.Tipo}</span>
        </div>
        {stand.Whatsapp && (
          <div className="flex items-center">
            <MessageSquareText className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>WhatsApp: {stand.Whatsapp}</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <Megaphone className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Anúncios: {stand.Anuncios}</span>
          </div>
          <div className="flex items-center">
            <Code className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>API: {stand.API}</span>
          </div>
          <div className="flex items-center">
            <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Publicados: {stand.Publicados}</span>
          </div>
          <div className="flex items-center">
            <Archive className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Arquivados: {stand.Arquivados}</span>
          </div>
          <div className="flex items-center">
            <Save className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Guardados: {stand.Guardados}</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Δ Mês Passado: {stand.Delta_Publicados_Last_Day_Month}</span>
          </div>
          <div className="flex items-center">
            <MessageSquareText className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Leads Recebidas: {stand.Leads_Recebidas}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Leads Pendentes: {stand.Leads_Pendentes}</span>
          </div>
          <div className="flex items-center">
            <XOctagon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Leads Expiradas: {stand.Leads_Expiradas}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Leads Financiadas: {stand.Leads_Financiadas}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandCard;