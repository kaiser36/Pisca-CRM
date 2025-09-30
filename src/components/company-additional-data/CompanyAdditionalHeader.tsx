"use client";

import React from 'react';
import { CompanyAdditionalExcelData } from '@/types/crm';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <div className="mb-6">
      {/* Cover Banner */}
      <div className="h-44 bg-blue-100 rounded-t-lg shadow-inner bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2070&auto=format&fit=crop')" }}></div>

      {/* Main Info Section */}
      <div className="px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-14">
          {/* Logo */}
          <Avatar className="h-28 w-28 border-4 border-white bg-card shadow-lg flex-shrink-0">
            <AvatarImage src={company["Logotipo"] || undefined} alt={companyDisplayName} />
            <AvatarFallback className="text-3xl font-bold">{firstLetter}</AvatarFallback>
          </Avatar>

          {/* Name and Details Flex Container */}
          <div className="flex flex-col md:flex-row justify-between items-start w-full md:pl-6">
            {/* Company Name & Status */}
            <div className="mt-4 md:mt-0">
              <h1 className="text-3xl font-bold text-gray-800">{companyDisplayName}</h1>
              {isCompanyClosed && (
                <Badge variant="destructive" className="mt-1">Empresa Encerrada</Badge>
              )}
            </div>

            {/* Right-aligned Details */}
            <div className="text-sm text-gray-600 mt-4 md:mt-0 md:text-right space-y-1">
              <p><span className="font-semibold">ID Excel:</span> {company.excel_company_id}</p>
              {crmCompany?.Company_Email && <p><span className="font-semibold">Email:</span> {crmCompany.Company_Email}</p>}
              {crmCompany?.Website && <p><span className="font-semibold">Website:</span> <a href={crmCompany.Website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{crmCompany.Website}</a></p>}
              {crmCompany?.NIF && <p><span className="font-semibold">NIF:</span> {crmCompany.NIF}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pt-6 flex flex-wrap gap-2 border-t border-border mt-6">
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