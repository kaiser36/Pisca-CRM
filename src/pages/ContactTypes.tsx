import React from 'react';
import Layout from '@/components/layout/Layout';
import ContactTypeTable from '@/components/contact-types/ContactTypeTable.tsx';
import ContactTypeCreateForm from '@/components/contact-types/ContactTypeCreateForm.tsx';

const ContactTypes = () => {
  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gerir Tipos de Contacto</h1>
          <ContactTypeCreateForm />
        </div>
        <div className="p-4 bg-card rounded-lg shadow-sm">
          <ContactTypeTable />
        </div>
      </div>
    </Layout>
  );
};

export default ContactTypes;