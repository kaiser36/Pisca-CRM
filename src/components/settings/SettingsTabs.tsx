"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ExcelUploadCard from './ExcelUploadCard';
import AdditionalExcelUploadCard from './AdditionalExcelUploadCard';
import UserProfileSettings from './UserProfileSettings';
import { toast } from 'sonner';
import CrmDataExcelTemplateCard from './CrmDataExcelTemplateCard';
import AdditionalCompanyDataExcelTemplateCard from './AdditionalCompanyDataExcelTemplateCard';
import AccountContactExcelTemplateCard from './AccountContactExcelTemplateCard';
import DealExcelTemplateCard from './DealExcelTemplateCard';
import EmployeeExcelTemplateCard from './EmployeeExcelTemplateCard';
import TaskExcelTemplateCard from './TaskExcelTemplateCard';
import EasyvistaExcelTemplateCard from './EasyvistaExcelTemplateCard';

const SettingsTabs: React.FC = () => {
  const handleUploadSuccess = () => {
    // You can add more logic here if needed, e.g., refetching data
    console.log("Upload successful, refreshing data...");
    toast.info("Dados atualizados!", {
      description: "A pré-visualização da aplicação será atualizada em breve.",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      <Tabs defaultValue="data-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 h-10 rounded-lg bg-muted/70 p-1"> {/* Adjusted grid-cols back to 4 */}
          <TabsTrigger value="data-upload" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Carregar Dados
          </TabsTrigger>
          <TabsTrigger value="templates" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Modelos
          </TabsTrigger>
          <TabsTrigger value="user-profile" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Perfil do Utilizador
          </TabsTrigger>
          <TabsTrigger value="integrations" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Dados CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExcelUploadCard onUploadSuccess={handleUploadSuccess} />
                <AdditionalExcelUploadCard onUploadSuccess={handleUploadSuccess} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Ficheiros CSV</CardTitle>
              <CardDescription>Descarregue modelos CSV para as diferentes tabelas do CRM.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CrmDataExcelTemplateCard />
                <AdditionalCompanyDataExcelTemplateCard />
                <AccountContactExcelTemplateCard />
                <DealExcelTemplateCard />
                <EmployeeExcelTemplateCard />
                <TaskExcelTemplateCard />
                <EasyvistaExcelTemplateCard />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Definições de Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <UserProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Conteúdo para integrações...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTabs;