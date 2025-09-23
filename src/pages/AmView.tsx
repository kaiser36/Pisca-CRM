"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AmView: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestão de AMs</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo à Gestão de AMs</CardTitle>
              <CardDescription>Aqui poderá gerir as informações relacionadas com os Account Managers.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funcionalidades de gestão de AMs serão adicionadas aqui.</p>
            </CardContent>
          </Card>
          {/* MissingAdditionalDataList foi movido para a página Accounts */}
        </div>
      </div>
    </Layout>
  );
};

export default AmView;