"use client";

import React, { useState } from 'react';
import { CompanyAdditionalExcelData } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MapPin, Building, Globe, DollarSign, Package, Repeat, TrendingUp, Car, CheckCircle, XCircle, Calendar, User, Phone, Tag, Info, Banknote, LinkIcon, Clock, Users, Factory, ShieldCheck, Pencil, Landmark, Briefcase, PlusCircle, MessageSquareMore, Eye, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CompanyAdditionalEditForm from './CompanyAdditionalEditForm';
import StandCard from '@/components/crm/StandCard';
import AccountContactCreateForm from './AccountContactCreateForm';
import AccountContactList from './AccountContactList';
import EasyvistaCreateForm from './EasyvistaCreateForm';
import EasyvistaList from './EasyvistaList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
            <CardTitle className="text-2xl font-bold">{company["Nome Comercial"] || company.crmCompany?.Company_Name || "N/A"}</CardTitle>
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
              <Accordion type="multiple" className="w-full space-y-4">
                <AccordionItem value="essential-info" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <Info className="mr-2 h-5 w-5 text-muted-foreground" />
                      Informações Essenciais da Empresa
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Building, "Nome Fiscal", company.crmCompany?.Company_Name)}
                    {renderField(Building, "Nome Comercial", company["Nome Comercial"])}
                    {renderField(Landmark, "NIF", company.crmCompany?.NIF)}
                    {renderField(Mail, "Email Principal", company["Email da empresa"] || company.crmCompany?.Company_Email)}
                    {renderField(Globe, "Website", company["Site"] || company.crmCompany?.Website)}
                    {renderField(Car, "Logotipo (URL)", company["Logotipo"])}
                    {renderField(Building, "Tipo de Empresa", company["Tipo de empresa"])}
                    {renderField(Factory, "Grupo", company["Grupo"])}
                    {renderField(Tag, "Marcas Representadas", company["Marcas representadas"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="location-address" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                      Localização e Morada
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(MapPin, "Morada", company["Morada"] || company.crmCompany?.Company_Address)}
                    {renderField(MapPin, "Código Postal", company["STAND_POSTAL_CODE"] || company.crmCompany?.Company_Postal_Code)}
                    {renderField(MapPin, "Distrito", company["Distrito"] || company.crmCompany?.District)}
                    {renderField(MapPin, "Cidade", company["Cidade"] || company.crmCompany?.Company_City)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-management" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-muted-foreground" />
                      Gestão de Conta (AM)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(User, "Pessoa de Contacto (CRM)", company.crmCompany?.Company_Contact_Person)}
                    {renderField(Briefcase, "Supervisor (CRM)", company.crmCompany?.Supervisor)}
                    {renderField(User, "AM Antigo", company["AM_OLD"])}
                    {renderField(User, "AM Atual", company["AM"])}
                    {renderField(Calendar, "Data Última Visita", company["Data ultima visita"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stock-api" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <Package className="mr-2 h-5 w-5 text-muted-foreground" />
                      Dados de Stock e API
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Package, "Stock STV", company["Stock STV"] || company.crmCompany?.Stock_STV)}
                    {renderField(Package, "Stock na Empresa", company["Stock na empresa"] || company.crmCompany?.Company_Stock)}
                    {renderField(Info, "API Info", company["API"] || company.crmCompany?.Company_API_Info)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="plan-financing" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                      Detalhes do Plano e Financiamento
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Wallet, "Plafond", company.crmCompany?.Plafond)}
                    {renderField(Package, "Último Plano", company["Plano Indicado"] || company.crmCompany?.Last_Plan)}
                    {renderField(DollarSign, "Preço do Plano", company.crmCompany?.Plan_Price)}
                    {renderField(Calendar, "Expiração do Plano", company.crmCompany?.Plan_Expiration_Date)}
                    {renderField(CheckCircle, "Plano Ativo", company.crmCompany?.Plan_Active)}
                    {renderField(Repeat, "Renovação Automática", company.crmCompany?.Plan_Auto_Renewal)}
                    {renderField(TrendingUp, "Bumps Atuais", company.crmCompany?.Current_Bumps)}
                    {renderField(TrendingUp, "Bumps Totais", company.crmCompany?.Total_Bumps)}
                    {renderField(Banknote, "Mediador de Crédito", company["Mediador de credito"])}
                    {renderField(LinkIcon, "Link Banco de Portugal", company["Link do Banco de Portugal"])}
                    {renderField(ShieldCheck, "Financeiras com Acordo", company["Financeiras com acordo"])}
                    {renderField(Car, "Simulador Financiamento", company.crmCompany?.Financing_Simulator_On)}
                    {renderField(Car, "Cor do Simulador", company.crmCompany?.Simulator_Color)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="marketing-competition" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
                      Marketing e Concorrência
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Tag, "Classificação", company["Classificação"])}
                    {renderField(TrendingUp, "Percentagem de Importados", company["Percentagem de Importados"])}
                    {renderField(Car, "Onde compra as viaturas", company["Onde compra as viaturas"])}
                    {renderField(Users, "Concorrência", company["Concorrencia"])}
                    {renderField(DollarSign, "Investimento Redes Sociais", company["Investimento redes sociais"])}
                    {renderField(DollarSign, "Investimento em Portais", company["Investimento em portais"])}
                    {renderField(Building, "Mercado B2B", company["Mercado b2b"])}
                    {renderField(ShieldCheck, "Utiliza CRM", company["Utiliza CRM"])}
                    {renderField(Info, "Qual o CRM", company["Qual o CRM"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="partnerships-other" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <ShieldCheck className="mr-2 h-5 w-5 text-muted-foreground" />
                      Parcerias e Outros
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(CheckCircle, "Parceiro Credibom (CRM)", company.crmCompany?.Is_CRB_Partner)}
                    {renderField(CheckCircle, "Parceiro APDCA (CRM)", company.crmCompany?.Is_APDCA_Partner)}
                    {renderField(ShieldCheck, "Quer CT", company["Quer CT"])}
                    {renderField(ShieldCheck, "Quer ser Parceiro Credibom (Adicional)", company["Quer ser parceiro Credibom"])}
                    {renderField(Info, "Autobiz", company["Autobiz"])}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="important-dates" className="border rounded-md shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                      Datas Importantes
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(Calendar, "Data de Criação (CRM)", company.crmCompany?.Creation_Date)}
                    {renderField(Clock, "Último Login (CRM)", company.crmCompany?.Last_Login_Date)}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Separator className="my-6" />
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