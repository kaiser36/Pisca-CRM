"use client";

import React from 'react';
import { CompanyAdditionalExcelData, Company } from '@/types/crm';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Eye, Handshake, UserPlus, ListTodo, Pencil, BarChart2 } from 'lucide-react';
import CompanyAdditionalEditForm from './CompanyAdditionalEditForm';
import AccountContactCreateForm from './AccountContactCreateForm';
import EasyvistaCreateForm from './EasyvistaCreateForm';
import DealCreateForm from './DealCreateForm';
import EmployeeCreateForm from './EmployeeCreateForm';
import TaskCreateForm from './TaskCreateForm';
import AnalyticsCreateFormForCompany from './AnalyticsCreateFormForCompany';

interface CompanyAdditionalHeaderProps {
  company: CompanyAdditionalExcelData;
  companyDisplayName: string;
  firstLetter: string;
  isCompanyClosed: boolean;
  onDataUpdated: () => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isCreateContactDialogOpen: boolean;
  setIsCreateContactDialogOpen: (open: boolean) => void;
  isCreateEasyvistaDialogOpen: boolean;
  setIsCreateEasyvistaDialogOpen: (open: boolean) => void;
  isCreateDealDialogOpen: boolean;
  setIsCreateDealDialogOpen: (open: boolean) => void;
  isCreateEmployeeDialogOpen: boolean;
  setIsCreateEmployeeDialogOpen: (open: boolean) => void;
  isCreateTaskDialogOpen: boolean;
  setIsCreateTaskDialogOpen: (open: boolean) => void;
  isCreateAnalysisDialogOpen: boolean;
  setIsCreateAnalysisDialogOpen: (open: boolean) => void;
}

const CompanyAdditionalHeader: React.FC<CompanyAdditionalHeaderProps> = ({
  company,
  companyDisplayName,
  firstLetter,
  isCompanyClosed,
  onDataUpdated,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isCreateContactDialogOpen,
  setIsCreateContactDialogOpen,
  isCreateEasyvistaDialogOpen,
  setIsCreateEasyvistaDialogOpen,
  isCreateDealDialogOpen,
  setIsCreateDealDialogOpen,
  isCreateEmployeeDialogOpen,
  setIsCreateEmployeeDialogOpen,
  isCreateTaskDialogOpen,
  setIsCreateTaskDialogOpen,
  isCreateAnalysisDialogOpen,
  setIsCreateAnalysisDialogOpen,
}) => {
  const crmCompany = company.crmCompany;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-16 w-16 mr-3">
          <AvatarImage src={company["Logotipo"] || undefined} alt={companyDisplayName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {firstLetter}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-2xl font-bold">{companyDisplayName}</CardTitle>
          <CardDescription className="text-muted-foreground">ID Excel: {company.excel_company_id}</CardDescription>
        </div>
        {isCompanyClosed && (
          <Badge variant="destructive" className="text-sm px-3 py-1">Empresa Encerrada</Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Dialog open={isCreateContactDialogOpen} onOpenChange={setIsCreateContactDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
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
              companyName={crmCompany?.Company_Name || company["Nome Comercial"]}
              onSave={() => setIsCreateContactDialogOpen(false)}
              onCancel={() => setIsCreateContactDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateEasyvistaDialogOpen} onOpenChange={setIsCreateEasyvistaDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
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

        <Dialog open={isCreateDealDialogOpen} onOpenChange={setIsCreateDealDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
              <Handshake className="mr-2 h-4 w-4" /> Novo Negócio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Negócio</DialogTitle>
            </DialogHeader>
            <DealCreateForm
              companyExcelId={company.excel_company_id}
              commercialName={company["Nome Comercial"] || crmCompany?.Commercial_Name}
              onSave={() => setIsCreateDealDialogOpen(false)}
              onCancel={() => setIsCreateDealDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateEmployeeDialogOpen} onOpenChange={setIsCreateEmployeeDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
              <UserPlus className="mr-2 h-4 w-4" /> Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
            </DialogHeader>
            <EmployeeCreateForm
              companyExcelId={company.excel_company_id}
              commercialName={company["Nome Comercial"] || crmCompany?.Commercial_Name}
              onSave={() => setIsCreateEmployeeDialogOpen(false)}
              onCancel={() => setIsCreateEmployeeDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
              <ListTodo className="mr-2 h-4 w-4" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <TaskCreateForm
              companyExcelId={company.excel_company_id}
              onSave={() => {
                setIsCreateTaskDialogOpen(false);
                onDataUpdated();
              }}
              onCancel={() => setIsCreateTaskDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateAnalysisDialogOpen} onOpenChange={setIsCreateAnalysisDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
              <BarChart2 className="mr-2 h-4 w-4" /> Nova Análise
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Análise de Campanha</DialogTitle>
            </DialogHeader>
            <AnalyticsCreateFormForCompany
              companyDbId={company.company_db_id!}
              companyExcelId={company.excel_company_id}
              commercialName={companyDisplayName}
              onSave={() => {
                setIsCreateAnalysisDialogOpen(false);
                onDataUpdated();
              }}
              onCancel={() => setIsCreateAnalysisDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
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
  );
};

export default CompanyAdditionalHeader;