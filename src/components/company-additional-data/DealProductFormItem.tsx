"use client";

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Product } from '@/types/crm';

interface DealProductFormItemProps {
  index: number;
  allProducts: Product[];
  onRemove: (index: number) => void;
  onProductChange: (index: number, productId: string | null, quantity: number) => void;
  initialProductId?: string | null;
  initialQuantity?: number;
}

const DealProductFormItem: React.FC<DealProductFormItemProps> = ({
  index,
  allProducts,
  onRemove,
  onProductChange,
  initialProductId,
  initialQuantity,
}) => {
  const { watch, setValue } = useFormContext();

  // Watch individual fields for this product item
  const selectedProductId = watch(`deal_products.${index}.product_id`);
  const quantity = watch(`deal_products.${index}.quantity`);
  const productCategory = watch(`deal_products.${index}.product_category`); // Watch category for filtering

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Initialize form fields
  useEffect(() => {
    setValue(`deal_products.${index}.product_id`, initialProductId || '');
    setValue(`deal_products.${index}.quantity`, initialQuantity || 1);
  }, [initialProductId, initialQuantity, index, setValue]);

  // Filter products by category
  useEffect(() => {
    if (productCategory) {
      setFilteredProducts(allProducts.filter(p => p.categoria === productCategory));
    } else {
      setFilteredProducts(allProducts);
    }
  }, [productCategory, allProducts]);

  // Update current product details when selectedProductId changes
  useEffect(() => {
    const product = allProducts.find(p => p.id === selectedProductId);
    setCurrentProduct(product || null);
    if (product) {
      setValue(`deal_products.${index}.unit_price_at_deal_time`, product.preco_unitario || 0);
      setValue(`deal_products.${index}.total_price_at_deal_time`, (product.preco_total || 0) * (quantity || 1));
      setValue(`deal_products.${index}.product_name`, product.produto);
      setValue(`deal_products.${index}.product_category`, product.categoria);
    } else {
      setValue(`deal_products.${index}.unit_price_at_deal_time`, 0);
      setValue(`deal_products.${index}.total_price_at_deal_time`, 0);
      setValue(`deal_products.${index}.product_name`, '');
      setValue(`deal_products.${index}.product_category`, '');
    }
    onProductChange(index, selectedProductId, quantity);
  }, [selectedProductId, quantity, allProducts, index, setValue, onProductChange]);

  const productCategories = Array.from(new Set(allProducts.map(p => p.categoria).filter((cat): cat is string => cat !== null && cat.trim() !== '')));

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border p-4 rounded-md bg-muted/50">
      <div className="md:col-span-1">
        <Label htmlFor={`product-category-${index}`}>Categoria</Label>
        <Select
          onValueChange={(value) => {
            setValue(`deal_products.${index}.product_category`, value);
            setValue(`deal_products.${index}.product_id`, ''); // Reset product when category changes
          }}
          value={productCategory || ''}
        >
          <SelectTrigger id={`product-category-${index}`}>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {productCategories.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor={`product-id-${index}`}>Produto</Label>
        <Select
          onValueChange={(value) => setValue(`deal_products.${index}.product_id`, value)}
          value={selectedProductId || ''}
          disabled={!productCategory} // Disable product selection if no category
        >
          <SelectTrigger id={`product-id-${index}`}>
            <SelectValue placeholder="Selecione o produto" />
          </SelectTrigger>
          <SelectContent>
            {filteredProducts.map(product => (
              <SelectItem key={product.id} value={product.id!}>{product.produto}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`quantity-${index}`}>Quantidade</Label>
        <Input
          id={`quantity-${index}`}
          type="number"
          min="1"
          value={quantity || 1}
          onChange={(e) => setValue(`deal_products.${index}.quantity`, Number(e.target.value))}
          disabled={!selectedProductId}
        />
      </div>
      <div className="flex items-center justify-end">
        <Button variant="destructive" size="icon" onClick={() => onRemove(index)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      {currentProduct && (
        <div className="md:col-span-5 text-sm text-muted-foreground mt-2">
          <p>Preço Unitário: {currentProduct.preco_unitario?.toFixed(2) || '0.00'} €</p>
          <p>Preço Total do Produto: {currentProduct.preco_total?.toFixed(2) || '0.00'} €</p>
          <p>Valor do Item: {((currentProduct.preco_total || 0) * (quantity || 1)).toFixed(2)} €</p>
        </div>
      )}
    </div>
  );
};

export default DealProductFormItem;