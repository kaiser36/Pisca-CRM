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
import DealExcelTemplateCard from './DealExcelTemplateCard';
import EasyvistaExcelUploadCard from './EasyvistaExcelUploadCard';
import DealExcelUploadCard from './DealExcelUploadCard';
import TaskExcelTemplateCard from './TaskExcelTemplateCard'; // NEW: Import TaskExcelTemplateCard
import TaskExcelUploadCard from './TaskExcelUploadCard'; // NEW: Import TaskExcelUploadCard

const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="upload-data" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-10">
        <TabsTrigger value="upload-data">Carregar Dados</TabsTrigger>
        <TabsTrigger value="templates">Modelos</TabsTrigger>
      </TabsList>
      <TabsContent value="upload-data" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ExcelUploadCard />
          <AdditionalExcelUploadCard />
          <EmployeeExcelUploadCard />
          <AccountContactExcelUploadCard />
          <EasyvistaExcelUploadCard />
          <DealExcelUploadCard />
          <TaskExcelUploadCard /> {/* NEW: Add the new upload card here */}
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
          <TaskExcelTemplateCard /> {/* NEW: Add the new template card here */}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;