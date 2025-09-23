"use client";

import React, { useState } from 'react';
import { CompanyAdditionalExcelData } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MapPin, Building, Globe, DollarSign, Package, Repeat, TrendingUp, Car, CheckCircle, XCircle, Calendar, User, Phone, Tag, Info, Banknote, LinkIcon, Clock, Users, Factory, ShieldCheck, Pencil, Landmark, Briefcase, PlusCircle, MessageSquareMore, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CompanyAdditionalEditForm from './CompanyAdditionalEditForm';
import StandCard from '@/components/crm/StandCard';
import AccountContactCreateForm from './AccountContactCreateForm';
import AccountContactList from './AccountContactList';
import EasyvistaCreateForm from './EasyvistaCreateForm';
import EasyvistaList from './EasyvistaList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CompanyAdditionalDetailCardProps {
  company: CompanyAdditionalExcelData | null;
  onDataUpdated: () => void;
}

const CompanyAdditionalDetailCard: React.FC<CompanyAdditionalDetailCardProps> = ({ company, onDataUpdated }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateContactDialogOpen, setIsCreateContactDialogOpen] = useState(false);
  const [isCreateEasyvistaDialogOpen, setIsCreateEasyvistaDialogOpen] = useState(false);

  if (!company) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4 rounded-lg border bg-card">
        Selecione uma empresa para ver os detalhes adicionais.
      </div>
    );
  }

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !label.includes('Plafond') && !label.includes('Preço') && !label.includes('Bumps') && !label.includes('Investimento') && !label.includes('Stock') && !label.includes('Percentagem'))) return null;

    let displayValue: React.ReactNode = value;
    if (typeof value === 'boolean') {
      displayValue = value ? (
        <span className="flex items-center text-green-600">
          <CheckCircle className="mr-1 h-4 w-4" /> Sim
        </span>
      ) : (
        <span className="flex items-center text-red-600">
          <XCircle className="mr-1 h-4 w-4" /> Não
        </span>
      );
    } else if (typeof value === 'number') {
      displayValue = value.toLocaleString('pt-PT');
    } else if (label.includes('Link') || label.includes('Site') || label.includes('Logotipo')) {
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-2xl font-bold">{company["Nome Comercial"] || "N/A"}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isCreateContactDialogOpen} onOpenChange={setIsCreateContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Contacto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Contacto de Conta</DialogTitle>
                  </DialogHeader>
                  <AccountContactCreateForm
                    companyExcelId={company.excel_company_id}
                    commercialName={company["Nome Comercial"]}
                    companyName={company.crmCompany?.Company_Name || company["Nome Comercial"]}
                    onSave={() => setIsCreateContactDialogOpen(false)}
                    onCancel={() => setIsCreateContactDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateEasyvistaDialogOpen} onOpenChange={setIsCreateEasyvistaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" /> Novo Easyvista
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Registo Easyvista</DialogTitle>
                  </DialogHeader>
                  <EasyvistaCreateForm
                    companyExcelId={company.excel_company_id}
                    commercialName={company["Nome Comercial"]}
                    onSave={() => setIsCreateEasyvistaDialogOpen(false)}
                    onCancel={() => setIsCreateEasyvistaDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Dados Adicionais da Empresa</DialogTitle>
                  </DialogHeader>
                  <CompanyAdditionalEditForm
                    company={company}
                    onSave={() => {
                      setIsEditDialogOpen(false);
                      onDataUpdated();
                    }}
                    onCancel={() => setIsEditDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <CardDescription className="text-muted-foreground">ID Excel: {company.excel_company_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6"> {/* Increased spacing */}
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-10"> {/* Adjusted grid for tabs */}
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="stands">Stands</TabsTrigger>
              <TabsTrigger value="contacts">Contactos</TabsTrigger>
              <TabsTrigger value="easyvistas">Easyvistas</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4 space-y-6"> {/* Increased spacing */}
              {company.crmCompany && (
                <>
                  <h3 className="text-lg font-semibold text-primary">Informações do CRM Principal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Building, "Nome da Empresa (CRM)", company.crmCompany.Company_Name)}
                    {renderField(Landmark, "NIF (CRM)", company.crmCompany.NIF)}
                    {renderField(Mail, "Email da Empresa (CRM)", company.crmCompany.Company_Email)}
                    {renderField(User, "Pessoa de Contacto (CRM)", company.crmCompany.Company_Contact_Person)}
                    {renderField(Globe, "Website (CRM)", company.crmCompany.Website)}
                    {renderField(DollarSign, "Plafond (CRM)", company.crmCompany.Plafond)}
                    {renderField(Briefcase, "Supervisor (CRM)", company.crmCompany.Supervisor)}
                    {renderField(CheckCircle, "Parceiro Credibom (CRM)", company.crmCompany.Is_CRB_Partner)}
                    {renderField(CheckCircle, "APDCA (CRM)", company.crmCompany.Is_APDCA_Partner)}
                    {renderField(Calendar, "Data de Criação (CRM)", company.crmCompany.Creation_Date)}
                    {renderField(Clock, "Último Login (CRM)", company.crmCompany.Last_Login_Date)}
                    {renderField(Car, "Simulador Financiamento (CRM)", company.crmCompany.Financing_Simulator_On)}
                    {renderField(Package, "Último Plano (CRM)", company.crmCompany.Last_Plan)}
                    {renderField(DollarSign, "Preço do Plano (CRM)", company.crmCompany.Plan_Price)}
                    {renderField(Calendar, "Expiração do Plano (CRM)", company.crmCompany.Plan_Expiration_Date)}
                    {renderField(CheckCircle, "Plano Ativo (CRM)", company.crmCompany.Plan_Active)}
                    {renderField(Repeat, "Renovação Automática (CRM)", company.crmCompany.Plan_Auto_Renewal)}
                    {renderField(TrendingUp, "Bumps Atuais (CRM)", company.crmCompany.Current_Bumps)}
                    {renderField(TrendingUp, "Bumps Totais (CRM)", company.crmCompany.Total_Bumps)}
                  </div>
                  <Separator />
                </>
              )}

              <h3 className="text-lg font-semibold text-primary">Dados Adicionais do Excel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(Building, "Nome Comercial", company["Nome Comercial"])}
                {renderField(Mail, "Email da empresa", company["Email da empresa"])}
                {renderField(MapPin, "Código Postal do Stand", company["STAND_POSTAL_CODE"])}
                {renderField(MapPin, "Distrito", company["Distrito"])}
                {renderField(MapPin, "Cidade", company["Cidade"])}
                {renderField(MapPin, "Morada", company["Morada"])}
                {renderField(User, "AM Antigo", company["AM_OLD"])}
                {renderField(User, "AM Atual", company["AM"])}
                {renderField(Package, "Stock STV", company["Stock STV"])}
                {renderField(Info, "API", company["API"])}
                {renderField(Globe, "Site", company["Site"])}
                {renderField(Package, "Stock na empresa", company["Stock na empresa"])}
                {renderField(Car, "Logotipo", company["Logotipo"])}
                {renderField(Tag, "Classificação", company["Classificação"])}
                {renderField(TrendingUp, "Percentagem de Importados", company["Percentagem de Importados"])}
                {renderField(Car, "Onde compra as viaturas", company["Onde compra as viaturas"])}
                {renderField(Users, "Concorrência", company["Concorrencia"])}
                {renderField(DollarSign, "Investimento Redes Sociais", company["Investimento redes sociais"])}
                {renderField(DollarSign, "Investimento em Portais", company["Investimento em portais"])}
                {renderField(Building, "Mercado B2B", company["Mercado b2b"])}
                {renderField(ShieldCheck, "Utiliza CRM", company["Utiliza CRM"])}
                {renderField(Info, "Qual o CRM", company["Qual o CRM"])}
                {renderField(Package, "Plano Indicado", company["Plano Indicado"])}
                {renderField(Banknote, "Mediador de Crédito", company["Mediador de credito"])}
                {renderField(LinkIcon, "Link do Banco de Portugal", company["Link do Banco de Portugal"])}
                {renderField(ShieldCheck, "Financeiras com Acordo", company["Financeiras com acordo"])}
                {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                {renderField(Factory, "Grupo", company["Grupo"])}
                {renderField(Tag, "Marcas Representadas", company["Marcas representadas"])}
                {renderField(Building, "Tipo de Empresa", company["Tipo de empresa"])}
                {renderField(ShieldCheck, "Quer CT", company["Quer CT"])}
                {renderField(ShieldCheck, "Quer ser Parceiro Credibom", company["Quer ser parceiro Credibom"])}
                {renderField(Info, "Autobiz", company["Autobiz"])}
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Criado em: {company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'}
              </p>
            </TabsContent>
            <TabsContent value="stands" className="mt-4">
              {company.crmCompany && company.crmCompany.stands && company.crmCompany.stands.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {company.crmCompany.stands.map((stand) => (
                    <StandCard key={stand.Stand_ID} stand={stand} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum stand associado encontrado no CRM principal.</p>
              )}
            </TabsContent>
            <TabsContent value="contacts" className="mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                <MessageSquareMore className="mr-2 h-5 w-5" /> Histórico de Contactos
              </h3>
              <AccountContactList companyExcelId={company.excel_company_id} />
            </TabsContent>
            <TabsContent value="easyvistas" className="mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                <Eye className="mr-2 h-5 w-5" /> Registos Easyvista
              </h3>
              <EasyvistaList companyExcelId={company.excel_company_id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default CompanyAdditionalDetailCard;