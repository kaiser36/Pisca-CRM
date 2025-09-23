"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import ExcelUploadCard from '@/components/settings/ExcelUploadCard';
import AdditionalExcelUploadCard from '@/components/settings/AdditionalExcelUploadCard';
import AccountContactExcelTemplateCard from '@/components/settings/AccountContactExcelTemplateCard';
import CrmDataExcelTemplateCard from '@/components/settings/CrmDataExcelTemplateCard'; // New import
import AdditionalCompanyDataExcelTemplateCard from '@/components/settings/AdditionalCompanyDataExcelTemplateCard'; // New import

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Definições</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ExcelUploadCard />
          <AdditionalExcelUploadCard />
          <AccountContactExcelTemplateCard />
          <CrmDataExcelTemplateCard /> {/* Add the new CRM data template card here */}
          <AdditionalCompanyDataExcelTemplateCard /> {/* Add the new additional company data template card here */}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;