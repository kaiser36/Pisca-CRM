"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EasyvistaTypeManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToSettings = () => {
    navigate('/settings');
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={handleBackToSettings} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar às Definições
        </Button>
        <h1 className="text-3xl font-bold mb-6">Página de Gestão de Tipos de Easyvista (Teste)</h1>
        <p className="text-lg text-muted-foreground">Se está a ver esta mensagem, a rota está a funcionar!</p>
      </div>
    </Layout>
  );
};

export default EasyvistaTypeManagement;