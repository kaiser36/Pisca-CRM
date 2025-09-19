"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import ExcelUploadCard from '@/components/settings/ExcelUploadCard';
import CompanyDetailsUploadCard from '@/components/settings/CompanyDetailsUploadCard'; // Import the new component

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Definições</h1>
        <div className="grid grid-cols-1 gap-6">
          <ExcelUploadCard />
          <CompanyDetailsUploadCard /> {/* Add the new upload card here */}
          {/* Outras opções de configuração podem ser adicionadas aqui */}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;