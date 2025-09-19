"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import GeneralInfoCard from '@/components/general/GeneralInfoCard';
import ExcelDisplayCard from '@/components/general/ExcelDisplayCard'; // Import the new component

const Informacao: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Informação Geral</h1>
        <div className="grid grid-cols-1 gap-6">
          <GeneralInfoCard />
          <ExcelDisplayCard /> {/* Add the new Excel display card here */}
        </div>
      </div>
    </Layout>
  );
};

export default Informacao;