"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import GeneralInfoCard from '@/components/general/GeneralInfoCard';

const Informacao: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Informação Geral</h1>
        <GeneralInfoCard />
      </div>
    </Layout>
  );
};

export default Informacao;