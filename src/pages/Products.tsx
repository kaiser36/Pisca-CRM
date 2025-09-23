"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const Products: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestão de Produtos</h1>
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Visão Geral dos Produtos
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Esta página será dedicada à gestão dos produtos e serviços oferecidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground py-4">
              Funcionalidades de gestão de produtos serão implementadas aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Products;