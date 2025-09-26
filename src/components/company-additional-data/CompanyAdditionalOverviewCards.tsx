"use client";

import React from 'react';
import { Company, CompanyAdditionalExcelData } from '@/types/crm';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Package, Repeat, TrendingUp, Car, CheckCircle, Info, Wallet, BellRing, Upload, Archive, Save, ArrowRight, Download, Hourglass, XCircle as ExpiredIcon, Mail, Globe, Landmark, User, Calendar, Tag, Clock
} from 'lucide-react';

interface CompanyAdditionalOverviewCardsProps {
  companyAdditional: CompanyAdditionalExcelData;
  crmCompany: Company | undefined;
  alerts: string[];
  totalPublicados: number;
  totalArquivados: number;
  totalGuardados: number;
  totalLeadsRecebidas: number;
  totalLeadsPendentes: number;
  totalLeadsExpiradas: number;
  renderField: (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => React.ReactNode;
}

const CompanyAdditionalOverviewCards: React.FC<CompanyAdditionalOverviewCardsProps> = ({
  companyAdditional,
  crmCompany,
  alerts,
  totalPublicados,
  totalArquivados,
  totalGuardados,
  totalLeadsRecebidas,
  totalLeadsPendentes,
  totalLeadsExpiradas,
  renderField,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pisca Card */}
      <Card className="p-4 shadow-subtle border-l-4 border-primary/50 bg-primary/5 rounded-lg">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-primary">
          <Package className="mr-2 h-5 w-5" /> Pisca
        </CardTitle>
        <div className="space-y-2">
          {renderField(Package, "Último Plano", companyAdditional["Plano Indicado"] || crmCompany?.Last_Plan)}
          {renderField(CheckCircle, "Plano Ativo", crmCompany?.Plan_Active)}
          {renderField(Calendar, "Expiração do Plano", crmCompany?.Plan_Expiration_Date)}
          {renderField(Repeat, "Renovação Automática", crmCompany?.Plan_Auto_Renewal)}
          {renderField(TrendingUp, "Bumps Totais", crmCompany?.Total_Bumps)}
          {renderField(TrendingUp, "Bumps Atuais", crmCompany?.Current_Bumps)}
          {renderField(Wallet, "Plafond", crmCompany?.Plafond)}
        </div>
      </Card>

      {/* Resumo Card */}
      <Card className="p-4 shadow-subtle border-l-4 border-success/50 bg-success/5 rounded-lg">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-success">
          <Info className="mr-2 h-5 w-5" /> Resumo
        </CardTitle>
        <div className="space-y-2">
          {renderField(Tag, "Classificação", companyAdditional["Classificação"])}
          {renderField(CheckCircle, "Parceiro Credibom", crmCompany?.Is_CRB_Partner)}
          {renderField(Car, "Simulador Financiamento", crmCompany?.Financing_Simulator_On)}
          {renderField(Clock, "Último Login", crmCompany?.Last_Login_Date)}
          {renderField(Calendar, "Data Última Visita", companyAdditional["Data ultima visita"])}
        </div>
      </Card>

      {/* Alertas Card */}
      <Card className={`p-4 shadow-subtle border-l-4 ${alerts.length > 0 ? 'border-destructive/50 bg-destructive/5' : 'border-yellow-200 bg-yellow-50'} rounded-lg`}>
        <CardTitle className={`text-lg font-semibold mb-3 flex items-center ${alerts.length > 0 ? 'text-destructive' : 'text-yellow-800'}`}>
          <BellRing className="mr-2 h-5 w-5" /> Alertas
        </CardTitle>
        <div className="space-y-2">
          {alerts.length === 0 ? (
            <Alert className="bg-transparent border-none p-0 text-yellow-800">
              <AlertDescription className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" /> Sem alertas pendentes.
              </AlertDescription>
            </Alert>
          ) : (
            alerts.map((alert, index) => (
              <Alert key={index} variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive p-2">
                <AlertDescription className="flex items-center">
                  <Info className="mr-2 h-4 w-4" /> {alert}
                </AlertDescription>
              </Alert>
            ))
          )}
        </div>
      </Card>

      {/* Main Overview Card - Aggregated Data */}
      <Card className="p-6 shadow-subtle border-l-4 border-muted rounded-lg md:col-span-3">
        <div className="flex flex-col items-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 flex-1 w-full">
            {renderField(Mail, "Email", companyAdditional["Email da empresa"] || crmCompany?.Company_Email)}
            {renderField(Globe, "Website", companyAdditional["Site"] || crmCompany?.Website)}
            {renderField(Landmark, "NIF", crmCompany?.NIF)}
            {renderField(User, "AM Atual", companyAdditional["AM"] || crmCompany?.AM_Current)}
            {/* Aggregated Stand Data - Anúncios Pipeline */}
            <div className="flex items-center text-sm md:col-span-2 flex-wrap gap-x-2">
              <span className="font-medium flex items-center">
                <Upload className="mr-1 h-4 w-4 text-muted-foreground" /> Publicados: <span className="ml-1 text-foreground">{totalPublicados}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium flex items-center">
                <Archive className="mr-1 h-4 w-4 text-muted-foreground" /> Arquivados: <span className="ml-1 text-foreground">{totalArquivados}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium flex items-center">
                <Save className="mr-1 h-4 w-4 text-muted-foreground" /> Guardados: <span className="ml-1 text-foreground">{totalGuardados}</span>
              </span>
            </div>
            {/* Aggregated Stand Data - Leads Pipeline */}
            <div className="flex items-center text-sm md:col-span-2 flex-wrap gap-x-2 mt-2">
              <span className="font-medium flex items-center text-blue-700">
                <Download className="mr-1 h-4 w-4 text-blue-700" /> Leads Recebidas: <span className="ml-1">{totalLeadsRecebidas}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium flex items-center text-orange-700">
                <Hourglass className="mr-1 h-4 w-4 text-orange-700" /> Leads Pendentes: <span className="ml-1">{totalLeadsPendentes}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium flex items-center text-red-700">
                <ExpiredIcon className="mr-1 h-4 w-4 text-red-700" /> Leads Expiradas: <span className="ml-1">{totalLeadsExpiradas}</span>
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanyAdditionalOverviewCards;