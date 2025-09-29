"use client";

import React, { useMemo, useState, ElementType } from 'react';
import { CompanyAdditionalExcelData, Company, Stand, Easyvista } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Building, Calendar, CheckCircle, DollarSign, Globe, Hash, Mail, MapPin, Percent, Phone, Shield, Star, Tag, User, Users, XCircle } from 'lucide-react';
import CompanyAdditionalOverviewCards from './CompanyAdditionalOverviewCards';
import AnalyticsList from './AnalyticsList';
import AnalyticsCreateFormForCompany from './AnalyticsCreateFormForCompany';
import AccountContactsList from '@/components/account-contacts/AccountContactsList';
import EmployeesList from '@/components/employees/EmployeesList';
import DealsList from '@/components/deals/DealsList';
import TasksList from '@/components/tasks/TasksList';
import StandsList from '@/components/stands/StandsList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CompanyAdditionalDetailCardProps {
  company: CompanyAdditionalExcelData;
  crmCompany: Company;
  stands: Stand[];
  easyvistas: Easyvista[];
  onDataChange: () => void;
}

const CompanyAdditionalDetailCard: React.FC<CompanyAdditionalDetailCardProps> = ({
  company,
  crmCompany,
  stands,
  easyvistas,
  onDataChange,
}) => {
  const [isCreateAnalyticsOpen, setIsCreateAnalyticsOpen] = useState(false);

  const alerts = useMemo(() => {
    const alertsList: string[] = [];
    if (company['Email da empresa'] && crmCompany.company_email && company['Email da empresa'] !== crmCompany.company_email) {
      alertsList.push('O email da empresa diverge entre a base de dados e o ficheiro excel.');
    }
    if (company.AM && crmCompany.am_current && company.AM !== crmCompany.am_current) {
      alertsList.push('O Account Manager diverge entre a base de dados e o ficheiro excel.');
    }
    if (!crmCompany.is_crb_partner && (company['Quer ser parceiro Credibom'] || company['Mediador de credito'])) {
      alertsList.push('Empresa mostra interesse em ser parceiro Credibom mas não está marcada como tal.');
    }
    return alertsList;
  }, [company, crmCompany]);

  const totalPublicados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.publicados || 0), 0), [stands]);
  const totalArquivados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.arquivados || 0), 0), [stands]);
  const totalGuardados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.guardados || 0), 0), [stands]);
  const totalLeadsRecebidas = useMemo(() => stands.reduce((acc, stand) => acc + (stand.leads_recebidas || 0), 0), [stands]);
  const totalLeadsPendentes = useMemo(() => stands.reduce((acc, stand) => acc + (stand.leads_pendentes || 0), 0), [stands]);

  const renderField = (Icon: ElementType, label: string, value: string | number | boolean | null | undefined, isBoolean = false) => {
    let displayValue: React.ReactNode = value?.toString() || <span className="text-gray-400">N/A</span>;
    if (isBoolean) {
      displayValue = value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
    } else if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('www'))) {
      displayValue = <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">{value}</a>;
    }

    return (
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-gray-500 mt-1" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <div className="text-sm text-gray-800 break-words">{displayValue}</div>
        </div>
      </div>
    );
  };

  const piscaData = {
    totalAds: totalPublicados,
    plan: crmCompany?.last_plan,
  };

  const easyvistasData = {
    openTickets: easyvistas?.length,
    status: easyvistas?.length > 0 ? 'Ativo' : 'Nenhum',
  };

  const credibomData = {
    isPartner: crmCompany?.is_crb_partner,
    plafond: crmCompany?.plafond,
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gray-50 rounded-t-lg border-b">
        <CardTitle className="text-2xl font-bold text-gray-800">{company['Nome Comercial']}</CardTitle>
        <p className="text-sm text-gray-500">{crmCompany.company_name}</p>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 p-0 h-auto">
            <TabsTrigger value="overview" className="flex-1">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1">Análises</TabsTrigger>
            <TabsTrigger value="contacts" className="flex-1">Contactos da Conta</TabsTrigger>
            <TabsTrigger value="employees" className="flex-1">Colaboradores</TabsTrigger>
            <TabsTrigger value="deals" className="flex-1">Negócios</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">Tarefas</TabsTrigger>
            <TabsTrigger value="stands" className="flex-1">Stands</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
              {alerts.length > 0 && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 font-semibold">Alertas</p>
                      <ul className="mt-1 list-disc list-inside text-sm text-yellow-600">
                        {alerts.map((alert, index) => <li key={index}>{alert}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <CompanyAdditionalOverviewCards
                piscaData={piscaData}
                easyvistasData={easyvistasData}
                credibomData={credibomData}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                {renderField(Building, "Grupo", company.Grupo)}
                {renderField(Tag, "Marcas Representadas", company['Marcas representadas'])}
                {renderField(Star, "Classificação", company.Classificação)}
                {renderField(Mail, "Email da Empresa", company['Email da empresa'])}
                {renderField(Phone, "Contacto Principal", crmCompany.company_contact_person)}
                {renderField(Globe, "Site", company.Site)}
                {renderField(MapPin, "Morada", `${company.Morada}, ${company.Cidade}, ${company['STAND_POSTAL_CODE']}, ${company.Distrito}`)}
                {renderField(User, "Account Manager (Excel)", company.AM)}
                {renderField(User, "Account Manager (CRM)", crmCompany.am_current)}
                {renderField(User, "Account Manager (Antigo)", company.AM_OLD)}
                {renderField(Shield, "NIF", crmCompany.nif)}
                {renderField(DollarSign, "Investimento em Portais", company['Investimento em portais'])}
                {renderField(DollarSign, "Investimento Redes Sociais", company['Investimento redes sociais'])}
                {renderField(Percent, "Percentagem de Importados", company['Percentagem de Importados'])}
                {renderField(Users, "Concorrência", company.Concorrencia)}
                {renderField(Building, "Onde compra as viaturas", company['Onde compra as viaturas'])}
                {renderField(CheckCircle, "Utiliza CRM", company['Utiliza CRM'], true)}
                {renderField(Tag, "Qual o CRM", company['Qual o CRM'])}
                {renderField(CheckCircle, "Mercado B2B", company['Mercado b2b'], true)}
                {renderField(Tag, "Plano Indicado", company['Plano Indicado'])}
                {renderField(CheckCircle, "Mediador de Crédito", company['Mediador de credito'], true)}
                {renderField(Globe, "Link Banco de Portugal", company['Link do Banco de Portugal'])}
                {renderField(Building, "Financeiras com Acordo", company['Financeiras com acordo'])}
                {renderField(Calendar, "Data Última Visita", company['Data ultima visita'])}
                {renderField(CheckCircle, "Quer CT", company['Quer CT'], true)}
                {renderField(CheckCircle, "Quer ser parceiro Credibom", company['Quer ser parceiro Credibom'], true)}
                {renderField(Hash, "Stock STV", company['Stock STV'])}
                {renderField(Hash, "Stock na Empresa", company['Stock na empresa'])}
                {renderField(Tag, "API", company.API)}
                {renderField(Tag, "Autobiz", company.Autobiz)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="p-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsCreateAnalyticsOpen(true)}>Criar Nova Análise</Button>
            </div>
            <AnalyticsList companyExcelId={company.excel_company_id} onAnalyticsChanged={onDataChange} />
            <Dialog open={isCreateAnalyticsOpen} onOpenChange={setIsCreateAnalyticsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Análise</DialogTitle>
                </DialogHeader>
                <AnalyticsCreateFormForCompany
                  companyExcelId={company.excel_company_id}
                  companyDbId={crmCompany.id}
                  onSuccess={() => {
                    setIsCreateAnalyticsOpen(false);
                    onDataChange();
                  }}
                />
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="contacts" className="p-6">
            <AccountContactsList companyDbId={crmCompany.id} companyExcelId={company.excel_company_id} />
          </TabsContent>

          <TabsContent value="employees" className="p-6">
            <EmployeesList companyDbId={crmCompany.id} companyExcelId={company.excel_company_id} />
          </TabsContent>

          <TabsContent value="deals" className="p-6">
            <DealsList companyDbId={crmCompany.id} companyExcelId={company.excel_company_id} />
          </TabsContent>

          <TabsContent value="tasks" className="p-6">
            <TasksList companyDbId={crmCompany.id} companyExcelId={company.excel_company_id} />
          </TabsContent>

          <TabsContent value="stands" className="p-6">
            <StandsList stands={stands} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CompanyAdditionalDetailCard;