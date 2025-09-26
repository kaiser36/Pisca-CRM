"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProductCreateForm from '@/components/products/ProductCreateForm';
import ProductTable from '@/components/products/ProductTable';
import { fetchProducts } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/crm';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProducts = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setError("Utilizador não autenticado. Por favor, faça login para ver os produtos.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(userId);
      setProducts(data);
    } catch (err: any) {
      console.error("Erro ao carregar produtos:", err);
      setError(err.message || "Falha ao carregar os produtos.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadProducts();
    }
  }, [userId, loadProducts]);

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Gestão de Produtos</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Produto</DialogTitle>
              </DialogHeader>
              <ProductCreateForm
                onSave={() => {
                  setIsCreateDialogOpen(false);
                  loadProducts();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <ProductTable products={products} isLoading={isLoading} error={error} onProductChanged={loadProducts} />
        </div>
      </div>
    </Layout>
  );
};

export default Products;