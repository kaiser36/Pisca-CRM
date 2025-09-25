"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExcelUploadCard from './ExcelUploadCard';
import AdditionalExcelUploadCard from './AdditionalExcelUploadCard';
import AccountContactExcelTemplateCard from './AccountContactExcelTemplateCard';
import CrmDataExcelTemplateCard from './CrmDataExcelTemplateCard';
import AdditionalCompanyDataExcelTemplateCard from './AdditionalCompanyDataExcelTemplateCard';
import EmployeeExcelTemplateCard from './EmployeeExcelTemplateCard';
import EmployeeExcelUploadCard from './EmployeeExcelUploadCard';
import AccountContactExcelUploadCard from './AccountContactExcelUploadCard';
import EasyvistaExcelTemplateCard from './EasyvistaExcelTemplateCard';
import DealExcelTemplateCard from './DealExcelTemplateCard'; // Corrigido o nome do import
import EasyvistaExcelUploadCard from './EasyvistaExcelUploadCard';
import DealExcelUploadCard from './DealExcelUploadCard';
import TaskExcelTemplateCard from './TaskExcelTemplateCard';
import TaskExcelUploadCard from './TaskExcelUploadCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="upload-data" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-10">
        <TabsTrigger value="upload-data">Carregar Dados</TabsTrigger>
        <TabsTrigger value="templates">Modelos</TabsTrigger>
        <TabsTrigger value="easyvista-config">Easyvista</TabsTrigger>
      </TabsList>
      <TabsContent value="upload-data" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ExcelUploadCard />
          <AdditionalExcelUploadCard />
          <EmployeeExcelUploadCard />
          <AccountContactExcelUploadCard />
          <EasyvistaExcelUploadCard />
          <DealExcelUploadCard />
          <TaskExcelUploadCard />
        </div>
      </TabsContent>
      <TabsContent value="templates" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CrmDataExcelTemplateCard />
          <AdditionalCompanyDataExcelTemplateCard />
          <AccountContactExcelTemplateCard />
          <EmployeeExcelTemplateCard />
          <EasyvistaExcelTemplateCard />
          <DealExcelTemplateCard />
          <TaskExcelTemplateCard />
        </div>
      </TabsContent>
      <TabsContent value="easyvista-config" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="w-full max-w-md shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Settings2 className="mr-2 h-5 w-5" /> Gerir Tipos de Easyvista
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure os tipos personalizados que podem ser selecionados nos registos Easyvista.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/settings/easyvista-types">
                <Button className="w-full">
                  <Settings2 className="mr-2 h-4 w-4" /> Ir para Gestão de Tipos
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Adicione, edite ou remova tipos como "Bug", "Funcionalidade", "Melhoria", etc.
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;