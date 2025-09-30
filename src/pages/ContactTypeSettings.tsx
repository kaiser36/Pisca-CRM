"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import ContactTypeManager from '@/components/settings/ContactTypeManager';

const ContactTypeSettings: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Tipos de Contacto</h1>
        <ContactTypeManager />
      </div>
    </Layout>
  );
};

export default ContactTypeSettings;