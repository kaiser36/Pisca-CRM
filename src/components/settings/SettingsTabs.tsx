"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Users, Package, Gift, Settings2, Phone } from 'lucide-react';

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

  const crmSettingsCards = [
    {
      title: "Tipos de Contacto",
      description: "Gerir tipos de contacto e opções de relatório.",
      icon: Phone,
      onClick: handleContactTypesClick,
      link: null,
    },
    {
      title: "Tipos de Easyvista",
      description: "Configurar e gerir os tipos de tickets Easyvista.",
      icon: Settings2,
      link: "/settings/easyvista-types",
    },
    {
      title: "Produtos",
      description: "Gerir os produtos e serviços oferecidos.",
      icon: Package,
      link: "/products",
    },
    {
      title: "Campanhas",
      description: "Criar e gerir campanhas de marketing e descontos.",
      icon: Gift,
      link: "/campaigns",
    },
    {
      title: "Gestão de AMs",
      description: "Gerir as contas dos Account Managers.",
      icon: Users,
      link: "/accounts",
    },
  ];

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
              <CardDescription>Aceda e configure as diferentes áreas do seu CRM.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crmSettingsCards.map((setting) => {
                  const CardComponent = (
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow p-6 flex flex-col"
                      onClick={setting.onClick}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <setting.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">{setting.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground flex-grow">
                        {setting.description}
                      </p>
                    </Card>
                  );

                  return setting.link ? (
                    <Link to={setting.link} key={setting.title} className="flex">
                      {CardComponent}
                    </Link>
                  ) : (
                    <div key={setting.title} className="flex">
                      {CardComponent}
                    </div>
                  );
                })}
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