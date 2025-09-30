"use client";

import React, { useState } from 'react';
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
import ContactTypeSubMenu from './ContactTypeSubMenu';

const SettingsTabs: React.FC = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [showContactTypes, setShowContactTypes] = useState(false);

  const handleUploadSuccess = () => {
    console.log("Upload successful, refreshing data...");
    toast.info("Dados atualizados!", {
      description: "A pré-visualização da aplicação será atualizada em breve.",
    });
  };

  const handleContactTypesClick = () => {
    setShowContactTypes(true);
    setActiveSubMenu('contact-types');
  };

  const handleBackToMainSettings = () => {
    setShowContactTypes(false);
    setActiveSubMenu(null);
  };

  if (showContactTypes) {
    return <ContactTypeSubMenu onBack={handleBackToMainSettings} />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      <Tabs defaultValue="data-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-10 rounded-lg bg-muted/70 p-1">
          <TabsTrigger value="data-upload" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Carregar Dados
          </TabsTrigger>
          <TabsTrigger value="templates" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Modelos
          </TabsTrigger>
          <TabsTrigger value="crm-settings" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Definições CRM
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

        <TabsContent value="crm-settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Definições do CRM</CardTitle>
              <CardDescription>Configure as opções do seu CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow p-6"
                  onClick={handleContactTypesClick}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Tipos de Contacto</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gerir tipos de contacto e opções de relatório para personalizar o seu CRM.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Configurações Gerais</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configurações gerais do sistema e preferências.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Segurança</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configurações de segurança e privacidade.
                  </p>
                </Card>
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

        {/* Removed Notifications tab as it was empty */}
        {/* <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Definições de Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Conteúdo para notificações...</p>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default SettingsTabs;