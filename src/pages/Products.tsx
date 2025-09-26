"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { PlusCircle, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/crm';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('user_id', user.id)
      .order('produto', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      showError('Erro ao carregar produtos.');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar este produto?')) return;
    const toastId = toast.loading('A eliminar produto...');
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      showSuccess('Produto eliminado com sucesso!');
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showError(`Erro ao eliminar produto: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const filteredProducts = products.filter(product =>
    product.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.unidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.preco_unitario?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || // Convert to string
    product.preco_total?.toString().toLowerCase().includes(searchTerm.toLowerCase()) // Convert to string
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" /> A carregar produtos...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] text-red-500">
          <RefreshCw className="h-6 w-6 mr-2" /> Erro: {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <div className="flex items-center space-x-2">
            <Link to="/products/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>Gerencie os produtos disponíveis no seu CRM.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={fetchProducts}>
                <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Preço Unitário</TableHead>
                    <TableHead className="text-right">Preço Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.produto}</TableCell>
                        <TableCell>{product.categoria}</TableCell>
                        <TableCell>{product.unidade}</TableCell>
                        <TableCell className="text-right">{product.preco_unitario?.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{product.preco_total?.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/products/${product.id}`}>
                            <Button variant="ghost" size="icon" className="mr-2">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum produto encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}