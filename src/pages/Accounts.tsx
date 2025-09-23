"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MissingAdditionalDataList from "@/components/dashboard/MissingAdditionalDataList"; // Import MissingAdditionalDataList

const Accounts: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestão de Contas</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Added grid layout */}
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral das Contas</CardTitle>
              <CardDescription>Esta página é dedicada à gestão geral das contas de utilizador.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Mais funcionalidades de gestão de contas serão implementadas aqui.</p>
            </CardContent>
          </Card>
          <MissingAdditionalDataList /> {/* Added MissingAdditionalDataList here */}
        </div>
      </div>
    </Layout>
  );
};

export default Accounts;