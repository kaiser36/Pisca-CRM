"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Analytics: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Análise de Campanhas</h1>
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Visão Geral da Análise</CardTitle>
            <CardDescription className="text-muted-foreground">
              Esta página irá apresentar análises detalhadas das campanhas dos clientes Pisca.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground py-4">
              Funcionalidades de análise de campanhas serão implementadas aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;