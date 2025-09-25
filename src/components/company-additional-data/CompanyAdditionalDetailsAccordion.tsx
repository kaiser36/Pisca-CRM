"use client";

import React from 'react';
import { Company, CompanyAdditionalExcelData } from '@/types/crm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Info, MapPin, User, Package, DollarSign, TrendingUp, ShieldCheck, Calendar, Building, Globe, Landmark, Briefcase, Car, Factory, Tag, Wallet, Banknote, LinkIcon, Clock, Users, CheckCircle, Repeat
} from 'lucide-react';

interface CompanyAdditionalDetailsAccordionProps {
  companyAdditional: CompanyAdditionalExcelData;
  crmCompany: Company | undefined;
  renderField: (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => React.ReactNode;
}

const CompanyAdditionalDetailsAccordion: React.FC<CompanyAdditionalDetailsAccordionProps> = ({
  companyAdditional,
  crmCompany,
  renderField,
}) => {
  return (
    <Accordion type="multiple" className="w-full space-y-4">
      <AccordionItem value="essential-info" className="border rounded-lg shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
          <div className="flex items-center">
            <Info className="mr-2 h-5 w-5 text-muted-foreground" />
            Informações Essenciais da Empresa
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(Building, "Nome Fiscal", crmCompany?.Company_Name)}
          {renderField(Building, "Nome Comercial", companyAdditional["Nome Comercial"])}
          {renderField(Landmark, "NIF", crmCompany?.NIF)}
          {renderField(Info, "ID Interno (CRM)", crmCompany?.id)}
          {renderField(Globe, "Website", companyAdditional["Site"] || crmCompany?.Website)}
          {renderField(Car, "Logotipo (URL)", companyAdditional["Logotipo"])}
          {renderField(Building, "Tipo de Empresa", companyAdditional["Tipo de empresa"])}
          {renderField(Factory, "Grupo", companyAdditional["Grupo"])}
          {renderField(Tag, "Marcas Representadas", companyAdditional["Marcas representadas"])}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="location-address" className="border rounded-lg shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
            Localização e Morada
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(MapPin, "Morada", companyAdditional["Morada"] || crmCompany?.Company_Address)}
          {renderField(MapPin, "Código Postal", companyAdditional["STAND_POSTAL_CODE"] || crmCompany?.Company_Postal_Code)}
          {renderField(MapPin, "Distrito", companyAdditional["Distrito"] || crmCompany?.District)}
          {renderField(MapPin, "Cidade", companyAdditional["Cidade"] || crmCompany?.Company_City)}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="account-management" className="border rounded-lg shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5 text-muted-foreground" />
            Gestão de Conta (AM)
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(User, "Pessoa de Contacto (CRM)", crmCompany?.Company_Contact_Person)}
          {renderField(Briefcase, "Supervisor (CRM)", crmCompany?.Supervisor)}
          {renderField(User, "AM Antigo", companyAdditional["AM_OLD"])}
          {renderField(User, "AM Atual", companyAdditional["AM"])}
          {renderField(Calendar, "Data Última Visita", companyAdditional["Data ultima visita"])}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="stock-api" className="border rounded-lg shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
          <div className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-muted-foreground" />
            Dados de Stock e API
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(Package, "Stock STV", companyAdditional["Stock STV"] || crmCompany?.Stock_STV)}
          {renderField(Package, "Stock na Empresa", companyAdditional["Stock na empresa"] || crmCompany?.Company_Stock)}
          {renderField(Info, "API Info", companyAdditional["API"] || crmCompany?.Company_API_Info)}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="plan-financing" className="border rounded-lg shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
          <div className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
            Detalhes do Plano e Financiamento
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(Wallet, "Plafond", crmCompany?.Plafond)}
          {renderField(Package, "Último Plano", companyAdditional["Plano Indicado"] || crmCompany?.Last_Plan)}
          {renderField(DollarSign, "Preço do Plano", crmCompany?.Plan_Price)}
          {renderField(Calendar, "Expiração do Plano", crmCompany?.Plan_Expiration_Date)}
          {renderField(CheckCircle, "Plano Ativo", crmCompany?.Plan_Active)}
          {renderField(Repeat, "Renovação Automática", crmCompany?.Plan_Auto_Renewal)}
          {renderField(TrendingUp, "Bumps Atuais", crmCompany?.Current_Bumps)}
          {renderField(TrendingUp, "Bumps Totais", crmCompany?.Total_Bumps)}
          {renderField(Banknote, "Mediador de Crédito", companyAdditional["Mediador de credito"])}
          {renderField(LinkIcon, "Link Banco de Portugal", companyAdditional["Link do Banco de Portugal"])}
          {renderField(ShieldCheck, "Financeiras com Acordo", companyAdditional["Financeiras com acordo"])}
          {renderField(Car, "Simulador Financiamento", crmCompany?.Financing_Simulator_On)}
          {renderField(Car, "Cor do Simulador", crmCompany?.Simulator_Color)}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="marketing-competition" className="border rounded-lg shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
            Marketing e Concorrência
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(Tag, "Classificação", companyAdditional["Classificação"])}
          {renderField(TrendingUp, "Percentagem de Importados", companyAdditional["Percentagem de Importados"])}
          {renderField(Car, "Onde compra as viaturas", companyAdditional["Onde compra as viaturas"])}
          {renderField(Users, "Concorrência", companyAdditional["Concorrencia"])}
          {renderField(DollarSign, "Investimento Redes Sociais", companyAdditional["Investimento redes sociais"])}
          {renderField(DollarSign, "Investimento em Portais", companyAdditional["Investimento em portais"])}
          {renderField(Building, "Mercado B2B", companyAdditional["Mercado b2b"])}
          {renderField(ShieldCheck, "Utiliza CRM", companyAdditional["Utiliza CRM"])}
          {renderField(Info, "Qual o CRM", companyAdditional["Qual o CRM"])}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="partnerships-other" className="border rounded-lg shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
          <div className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-muted-foreground" />
            Parcerias e Outros
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(CheckCircle, "Parceiro Credibom (CRM)", crmCompany?.Is_CRB_Partner)}
          {renderField(CheckCircle, "Parceiro APDCA (CRM)", crmCompany?.Is_APDCA_Partner)}
          {renderField(ShieldCheck, "Quer CT", companyAdditional["Quer CT"])}
          {renderField(ShieldCheck, "Quer ser Parceiro Credibom (Adicional)", companyAdditional["Quer ser parceiro Credibom"])}
          {renderField(Info, "Autobiz", crmCompany?.autobiz_info)}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="important-dates" className="border rounded-lg shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
            Datas Importantes
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 border-t bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(Calendar, "Data de Criação (CRM)", crmCompany?.Creation_Date)}
          {renderField(Clock, "Último Login (CRM)", crmCompany?.Last_Login_Date)}
          {renderField(Calendar, "Data Última Visita", companyAdditional["Data ultima visita"])}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CompanyAdditionalDetailsAccordion;