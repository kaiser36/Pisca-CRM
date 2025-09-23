"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MissingAdditionalDataList from "@/components/dashboard/MissingAdditionalDataList"; // New import

const Accounts: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestão de Contas</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo à Gestão de Contas</CardTitle>
              <CardDescription>Aqui poderá gerir as configurações da sua conta e outras opções relacionadas.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funcionalidades de gestão de contas serão adicionadas aqui.</p>
            </CardContent>
          </Card>
          <MissingAdditionalDataList /> {/* Add the MissingAdditionalDataList component here */}
        </div>
      </div>
    </Layout>
  );
};

export default Accounts;