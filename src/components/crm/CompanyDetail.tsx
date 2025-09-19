import React from 'react';
import { Company } from '@/types/crm';
import StandCard from './StandCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, User, Building, Landmark, Globe, Wallet, Briefcase, CheckCircle, XCircle } from 'lucide-react'; // Added Wallet, Briefcase, CheckCircle, XCircle icons

interface CompanyDetailProps {
  company: Company | null;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company }) => {
  if (!company) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Selecione uma empresa para ver os detalhes.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full pr-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{company.Company_Name}</CardTitle>
          <CardDescription>ID da Empresa: {company.Company_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm">
              <Landmark className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>NIF: {company.NIF}</span>
            </div>
            <div className="flex items-center text-sm">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Email da Empresa: {company.Company_Email}</span>
            </div>
            <div className="flex items-center text-sm">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Pessoa de Contacto: {company.Company_Contact_Person}</span>
            </div>
            {company.Website && (
              <div className="flex items-center text-sm">
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                <a href={company.Website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {company.Website}
                </a>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Plafond: {company.Plafond.toFixed(2)} €</span>
            </div>
            <div className="flex items-center text-sm">
              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Supervisor: {company.Supervisor}</span>
            </div>
            <div className="flex items-center text-sm">
              {company.Is_CRB_Partner ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
              )}
              <span>Parceiro Credibom: {company.Is_CRB_Partner ? 'Sim' : 'Não'}</span>
            </div>
          </div>
          <Separator />
          <h3 className="text-lg font-semibold mb-4">Pontos de Venda ({company.stands.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.stands.map((stand) => (
              <StandCard key={stand.Stand_ID} stand={stand} />
            ))}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default CompanyDetail;