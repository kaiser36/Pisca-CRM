"use client";

import React, { ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyAdditionalExcelData, Company } from '@/types/crm';
import CompanyAdditionalOverviewCards from './CompanyAdditionalOverviewCards';
import { AlertTriangle, Building, Mail, Phone, Globe, User, Calendar, Tag, Hash, MapPin, Briefcase, DollarSign, Info, Link as LinkIcon, Users } from 'lucide-react';

interface CompanyAdditionalDetailCardProps {
  company: CompanyAdditionalExcelData;
  crmCompany: Company | null;
  alerts: string[];
  renderField: (
    Icon: ElementType,
    label: string,
    value: string | number | boolean | null | undefined,
    options?: {
      isPlafond?: boolean;
      isDate?: boolean;
      isBoolean?: boolean;
      url?: string | null;
      className?: string;
    }
  ) => React.ReactNode;
}

const CompanyAdditionalDetailCard: React.FC<CompanyAdditionalDetailCardProps> = ({
  company,
  crmCompany,
  alerts,
  renderField,
}) => {
  if (!company) {
    return <div>A carregar dados da empresa...</div>;
  }

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2" /> Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5">
              {alerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <CompanyAdditionalOverviewCards
        additionalData={company}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Building className="mr-2" /> Informação Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderField(Building, "Nome Comercial", company['Nome Comercial'])}
            {renderField(Hash, "NIF", crmCompany?.NIF)}
            {renderField(Mail, "Email", company['Email da empresa'])}
            {renderField(MapPin, "Morada", `${company['Morada'] || ''}, ${company['STAND_POSTAL_CODE'] || ''} ${company['Cidade'] || ''}`)}
            {renderField(MapPin, "Distrito", company['Distrito'])}
            {renderField(Globe, "Site", company['Site'], { url: company['Site'] })}
            {renderField(LinkIcon, "Link Banco de Portugal", company['Link do Banco de Portugal'], { url: company['Link do Banco de Portugal'] })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><User className="mr-2" /> Gestão e Contactos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderField(User, "AM Atual", company['AM'])}
            {renderField(User, "AM Antigo", company['AM_OLD'])}
            {renderField(Briefcase, "Grupo", company['Grupo'])}
            {renderField(Tag, "Marcas Representadas", company['Marcas representadas'])}
            {renderField(Info, "Tipo de Empresa", company['Tipo de empresa'])}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><DollarSign className="mr-2" /> Negócio e Estratégia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderField(Info, "Onde compra as viaturas", company['Onde compra as viaturas'])}
            {renderField(Users, "Concorrência", company['Concorrencia'])}
            {renderField(Tag, "Plano Indicado", company['Plano Indicado'])}
            {renderField(Info, "Autobiz", company['Autobiz'])}
            {renderField(Info, "Financeiras com acordo", company['Financeiras com acordo'])}
            {renderField(Calendar, "Data da última visita", company['Data ultima visita'], { isDate: true })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Info className="mr-2" /> Flags e Opções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderField(Info, "Mercado B2B", company['Mercado b2b'], { isBoolean: true })}
            {renderField(Info, "Utiliza CRM", company['Utiliza CRM'], { isBoolean: true })}
            {renderField(Info, "Qual o CRM", company['Qual o CRM'])}
            {renderField(Info, "Mediador de crédito", company['Mediador de credito'], { isBoolean: true })}
            {renderField(Info, "Quer CT", company['Quer CT'], { isBoolean: true })}
            {renderField(Info, "Quer ser parceiro Credibom", company['Quer ser parceiro Credibom'], { isBoolean: true })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyAdditionalDetailCard;