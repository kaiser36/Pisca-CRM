"use client";

import React, { useState } from 'react';
import { Product } from '@/types/crm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Package, Tag, Ruler, DollarSign, Edit, Trash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ProductEditForm from './ProductEditForm';
import { deleteProduct } from '@/integrations/supabase/utils';
import { showError, showSuccess } from '@/utils/toast';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onProductChanged: () => void; // Callback to refresh data
}

const ProductTable: React.FC<ProductTableProps> = ({ products, isLoading, error, onProductChanged }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      showSuccess("Produto eliminado com sucesso!");
      onProductChanged();
    } catch (err: any) {
      console.error("Erro ao eliminar produto:", err);
      showError(err.message || "Falha ao eliminar o produto.");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>A carregar dados dos produtos...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>Nenhum produto encontrado.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Não há dados de produtos para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Lista de Produtos</CardTitle>
        <CardDescription className="text-muted-foreground">Gerencie os produtos e serviços oferecidos.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Produto</TableHead>
                <TableHead className="w-[120px]">Categoria</TableHead>
                <TableHead className="w-[100px]">Unidade</TableHead>
                <TableHead className="text-right w-[120px]">Preço Unitário</TableHead>
                <TableHead className="text-right w-[120px]">Preço Total</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium flex items-center py-3">
                    <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                    {product.produto}
                  </TableCell>
                  <TableCell className="py-3 flex items-center">
                    <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                    {product.categoria || 'N/A'}
                  </TableCell>
                  <TableCell className="py-3 flex items-center">
                    <Ruler className="mr-2 h-4 w-4 text-muted-foreground" />
                    {product.unidade || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right py-3 flex items-center justify-end">
                    <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                    {product.preco_unitario?.toFixed(2) || '0.00'} €
                  </TableCell>
                  <TableCell className="text-right py-3 flex items-center justify-end">
                    <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                    {product.preco_total?.toFixed(2) || '0.00'} €
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o produto "{product.produto}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => product.id && handleDelete(product.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {selectedProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            <ProductEditForm
              product={selectedProduct}
              onSave={() => {
                setIsEditDialogOpen(false);
                onProductChanged();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default ProductTable;