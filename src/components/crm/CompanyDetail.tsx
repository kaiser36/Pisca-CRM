import React from 'react';
import { Company } from '@/types/crm';
import StandCard from './StandCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, User, Building, Landmark, Globe, Wallet, Briefcase, CheckCircle, XCircle, Calendar, Clock, DollarSign, Package, Repeat, TrendingUp, Car, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyDetailProps {
  company: Company | null;
  onBack?: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onBack }) => {
  if (!company) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4 rounded-lg border bg-card">
        Selecione uma empresa para ver os detalhes.
      </div>
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
        <span className="flex items-center text-green-600">Sim</span>
      ) : (
        <span className="flex items-center text-red-600">Não</span>
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
      <div className="flex items-center text-sm">
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}:</span> <span className="ml-1 text-foreground">{displayValue}</span>
      </div>
    );
  };

  return (
    <ScrollArea className="h-full w-full pr-4">
      <Card className="w-full shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{company.Company_Name}</CardTitle>
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          <CardDescription className="text-muted-foreground">ID da Empresa: {company.Company_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
          
          {company.stands.length > 0 && (
            <>
              <Separator className="my-4" />
              <h3 className="text-lg font-semibold mb-4">Pontos de Venda ({company.stands.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.stands.map((stand) => (
                  <StandCard key={stand.Stand_ID} stand={stand} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default CompanyDetail;