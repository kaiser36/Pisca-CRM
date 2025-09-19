"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import AdditionalInfoUploadCard from '@/components/settings/AdditionalInfoUploadCard';

const MaisInfo: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Mais Informações da Empresa</h1>
        <div className="grid grid-cols-1 gap-6">
          <AdditionalInfoUploadCard />
        </div>
      </div>
    </Layout>
  );
};

export default MaisInfo;