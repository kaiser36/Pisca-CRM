import React from 'react';
import { Company } from '@/types/crm';
import StandCard from './StandCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, User, Building, Landmark, Globe, Wallet, Briefcase, CheckCircle, XCircle, Calendar, Clock, CreditCard, DollarSign, Package, Repeat, TrendingUp, Car, ArrowLeft, Tag, MapPin, Factory, Percent, Truck, Users, BarChart, Banknote, Link, History, Group, Award, Type, CheckSquare, Info, Code } from 'lucide-react'; // Added Code icon
import { Button } from '@/components/ui/button'; // Import Button

interface CompanyDetailProps {
  company: Company | null;
  onBack?: () => void; // New optional prop for back button
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onBack }) => {
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{company.Company_Name}</CardTitle>
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
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
            <div className="flex items-center text-sm">
              {company.Is_APDCA_Partner ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
              )}
              <span>APDCA: {company.Is_APDCA_Partner ? 'Verdadeiro' : 'Falso'}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Criação da Conta: {company.Creation_Date}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Último Login: {company.Last_Login_Date}</span>
            </div>
            <div className="flex items-center text-sm">
              {company.Financing_Simulator_On ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
              )}
              <span>Simulador Financiamento: {company.Financing_Simulator_On ? 'Ativo' : 'Desativado'}</span>
            </div>
            {company.Simulator_Color && (
              <div className="flex items-center text-sm">
                <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Cor do Simulador: {company.Simulator_Color}</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Último Plano: {company.Last_Plan}</span>
            </div>
            <div className="flex items-center text-sm">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Preço do Plano: {company.Plan_Price.toFixed(2)} €</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Expiração do Plano: {company.Plan_Expiration_Date}</span>
            </div>
            <div className="flex items-center text-sm">
              {company.Plan_Active ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
              )}
              <span>Plano Ativo: {company.Plan_Active ? 'Sim' : 'Não'}</span>
            </div>
            <div className="flex items-center text-sm">
              {company.Plan_Auto_Renewal ? (
                <Repeat className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
              )}
              <span>Renovação Automática: {company.Plan_Auto_Renewal ? 'Ativa' : 'Desativada'}</span>
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Bumps Atuais: {company.Current_Bumps}</span>
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Bumps Totais: {company.Total_Bumps}</span>
            </div>
          </div>
          
          <Separator />
          <h3 className="text-lg font-semibold mb-4">Informações Adicionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.Commercial_Name && (
              <div className="flex items-center text-sm">
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Nome Comercial: {company.Commercial_Name}</span>
              </div>
            )}
            {company.Company_Address && (
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Morada: {company.Company_Address}, {company.Company_Postal_Code} {company.Company_City} ({company.District})</span>
              </div>
            )}
            {company.AM_Old && (
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>AM Antigo: {company.AM_Old}</span>
              </div>
            )}
            {company.AM_Current && (
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>AM Atual: {company.AM_Current}</span>
              </div>
            )}
            {company.Stock_STV !== undefined && (
              <div className="flex items-center text-sm">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Stock STV: {company.Stock_STV}</span>
              </div>
            )}
            {company.Company_API_Info && (
              <div className="flex items-center text-sm">
                <Code className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Info API Empresa: {company.Company_API_Info}</span>
              </div>
            )}
            {company.Company_Stock !== undefined && (
              <div className="flex items-center text-sm">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Stock na Empresa: {company.Company_Stock}</span>
              </div>
            )}
            {company.Logo_URL && (
              <div className="flex items-center text-sm">
                <img src={company.Logo_URL} alt="Logo" className="mr-2 h-4 w-4 object-contain" />
                <span>Logotipo: <a href={company.Logo_URL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver</a></span>
              </div>
            )}
            {company.Classification && (
              <div className="flex items-center text-sm">
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Classificação: {company.Classification}</span>
              </div>
            )}
            {company.Imported_Percentage !== undefined && (
              <div className="flex items-center text-sm">
                <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Percentagem de Importados: {company.Imported_Percentage}%</span>
              </div>
            )}
            {company.Vehicle_Source && (
              <div className="flex items-center text-sm">
                <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Onde compra as viaturas: {company.Vehicle_Source}</span>
              </div>
            )}
            {company.Competition && (
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Concorrência: {company.Competition}</span>
              </div>
            )}
            {company.Social_Media_Investment !== undefined && (
              <div className="flex items-center text-sm">
                <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Investimento Redes Sociais: {company.Social_Media_Investment.toFixed(2)} €</span>
              </div>
            )}
            {company.Portal_Investment !== undefined && (
              <div className="flex items-center text-sm">
                <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Investimento em Portais: {company.Portal_Investment.toFixed(2)} €</span>
              </div>
            )}
            {company.B2B_Market !== undefined && (
              <div className="flex items-center text-sm">
                {company.B2B_Market ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                <span>Mercado B2B: {company.B2B_Market ? 'Sim' : 'Não'}</span>
              </div>
            )}
            {company.Uses_CRM !== undefined && (
              <div className="flex items-center text-sm">
                {company.Uses_CRM ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                <span>Utiliza CRM: {company.Uses_CRM ? 'Sim' : 'Não'}</span>
              </div>
            )}
            {company.CRM_Software && (
              <div className="flex items-center text-sm">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Qual o CRM: {company.CRM_Software}</span>
              </div>
            )}
            {company.Recommended_Plan && (
              <div className="flex items-center text-sm">
                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Plano Indicado: {company.Recommended_Plan}</span>
              </div>
            )}
            {company.Credit_Mediator !== undefined && (
              <div className="flex items-center text-sm">
                {company.Credit_Mediator ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                <span>Mediador de Crédito: {company.Credit_Mediator ? 'Sim' : 'Não'}</span>
              </div>
            )}
            {company.Bank_Of_Portugal_Link && (
              <div className="flex items-center text-sm">
                <Link className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Link Banco de Portugal: <a href={company.Bank_Of_Portugal_Link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver</a></span>
              </div>
            )}
            {company.Financing_Agreements && (
              <div className="flex items-center text-sm">
                <Banknote className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Financeiras com Acordo: {company.Financing_Agreements}</span>
              </div>
            )}
            {company.Last_Visit_Date && (
              <div className="flex items-center text-sm">
                <History className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Data Última Visita: {company.Last_Visit_Date}</span>
              </div>
            )}
            {company.Company_Group && (
              <div className="flex items-center text-sm">
                <Group className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Grupo da Empresa: {company.Company_Group}</span>
              </div>
            )}
            {company.Represented_Brands && (
              <div className="flex items-center text-sm">
                <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Marcas Representadas: {company.Represented_Brands}</span>
              </div>
            )}
            {company.Company_Type && (
              <div className="flex items-center text-sm">
                <Type className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Tipo de Empresa: {company.Company_Type}</span>
              </div>
            )}
            {company.Wants_CT !== undefined && (
              <div className="flex items-center text-sm">
                {company.Wants_CT ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                <span>Quer CT: {company.Wants_CT ? 'Sim' : 'Não'}</span>
              </div>
            )}
            {company.Wants_CRB_Partner !== undefined && (
              <div className="flex items-center text-sm">
                {company.Wants_CRB_Partner ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                <span>Quer ser Parceiro Credibom: {company.Wants_CRB_Partner ? 'Sim' : 'Não'}</span>
              </div>
            )}
            {company.Autobiz_Info && (
              <div className="flex items-center text-sm">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Autobiz Info: {company.Autobiz_Info}</span>
              </div>
            )}
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