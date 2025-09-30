"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ContactTypeSubMenu from '@/components/settings/ContactTypeSubMenu';

const ContactTypeManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToSettings = () => {
    navigate('/settings');
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={handleBackToSettings}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar às Definições
          </Button>
          <h1 className="text-3xl font-bold">Gestão de Tipos de Contacto</h1>
          {/* No create button here, as ContactTypeSubMenu handles its own UI */}
        </div>
        <ContactTypeSubMenu onBack={handleBackToSettings} />
      </div>
    </Layout>
  );
};

export default ContactTypeManagement;