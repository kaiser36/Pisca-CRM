"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import ExcelUploadCard from '@/components/settings/ExcelUploadCard';
import AdditionalExcelUploadCard from '@/components/settings/AdditionalExcelUploadCard'; // Import the new component

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Definições</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Adjusted grid for two cards */}
          <ExcelUploadCard />
          <AdditionalExcelUploadCard /> {/* Add the new Excel upload card here */}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;