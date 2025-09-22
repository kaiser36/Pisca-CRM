import React from 'react';
import { Company } from '@/types/crm';
import StandCard from './StandCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, User, Building, Landmark, Globe, Wallet, Briefcase, CheckCircle, XCircle, Calendar, Clock, CreditCard, DollarSign, Package, Repeat, TrendingUp, Car, ArrowLeft, FileText } from 'lucide-react'; // Added new icons and ArrowLeft, FileText
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; // Import Accordion components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Import Table components

interface CompanyDetailProps {
  company: Company | null;
  onBack?: () => void;
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
          <h3 className="text-lg font-semibold mb-4">Pontos de Venda ({company.stands.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.stands.map((stand) => (
              <StandCard key={stand.Stand_ID} stand={stand} />
            ))}
          </div>

          {company.genericExcelData && company.genericExcelData.length > 0 && (
            <>
              <Separator />
              <h3 className="text-lg font-semibold mb-4">Informação Complementar (Excel)</h3>
              <Accordion type="single" collapsible className="w-full">
                {company.genericExcelData.map((dataItem, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      {dataItem.file_name} (Linha {index + 1})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(dataItem.row_data).map((key) => (
                                <TableHead key={key}>{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              {Object.values(dataItem.row_data).map((value, valIndex) => (
                                <TableCell key={valIndex}>{String(value)}</TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default CompanyDetail;