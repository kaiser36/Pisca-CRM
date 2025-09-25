"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExcelUploadCard from './ExcelUploadCard';
import AdditionalExcelUploadCard from './AdditionalExcelUploadCard'; // Assuming this component exists
import { toast } from 'sonner';

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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 h-10 rounded-lg bg-muted/70 p-1">
          <TabsTrigger value="data-upload" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Carregar Dados
          </TabsTrigger>
          <TabsTrigger value="user-profile" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Perfil do Utilizador
          </TabsTrigger>
          <TabsTrigger value="integrations" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Integrações
          </TabsTrigger>
          <TabsTrigger value="notifications" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold">
            Notificações
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
                <AdditionalExcelUploadCard onUploadSuccess={handleUploadSuccess} /> {/* Assuming this also needs onUploadSuccess */}
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
              <p>Conteúdo para o perfil do utilizador...</p>
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

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Definições de Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Conteúdo para notificações...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTabs;