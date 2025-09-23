"use client";

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Product } from '@/types/crm';
import { cn } from '@/lib/utils';

interface DealProductFormItemProps {
  index: number;
  allProducts: Product[];
  onRemove: (index: number) => void;
  onProductChange: (index: number, productId: string | null, quantity: number) => void;
  initialProductId?: string | null;
  initialQuantity?: number;
  initialDiscountType?: 'none' | 'percentage' | 'amount' | null; // NEW
  initialDiscountValue?: number | null; // NEW
}

const DealProductFormItem: React.FC<DealProductFormItemProps> = ({
  index,
  allProducts,
  onRemove,
  onProductChange,
  initialProductId,
  initialQuantity,
  initialDiscountType, // NEW
  initialDiscountValue, // NEW
}) => {
  const { watch, setValue } = useFormContext();

  // Watch individual fields for this product item
  const selectedProductId = watch(`deal_products.${index}.product_id`);
  const quantity = watch(`deal_products.${index}.quantity`);
  const productCategory = watch(`deal_products.${index}.product_category`); // Watch category for filtering
  const discountType = watch(`deal_products.${index}.discount_type`); // NEW
  const discountValue = watch(`deal_products.${index}.discount_value`); // NEW

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Initialize form fields
  useEffect(() => {
    setValue(`deal_products.${index}.product_id`, initialProductId || '');
    setValue(`deal_products.${index}.quantity`, initialQuantity || 1);
    setValue(`deal_products.${index}.discount_type`, initialDiscountType || 'none'); // NEW
    setValue(`deal_products.${index}.discount_value`, initialDiscountValue || 0); // NEW

    // Set initial product category if initialProductId is provided
    if (initialProductId) {
      const product = allProducts.find(p => p.id === initialProductId);
      if (product) {
        setValue(`deal_products.${index}.product_category`, product.categoria || '');
      } else {
        // If initialProductId is provided but product not found (e.g., deleted), reset category
        setValue(`deal_products.${index}.product_category`, '');
      }
    } else {
      // Ensure category is reset if no initial product
      setValue(`deal_products.${index}.product_category`, '');
    }
  }, [initialProductId, initialQuantity, initialDiscountType, initialDiscountValue, index, setValue, allProducts]);

  // Filter products by category
  useEffect(() => {
    if (productCategory) {
      setFilteredProducts(allProducts.filter(p => p.categoria === productCategory));
    } else {
      setFilteredProducts(allProducts);
    }
  }, [productCategory, allProducts]);

  // Update current product details and calculate total_price_at_deal_time when relevant fields change
  useEffect(() => {
    const product = allProducts.find(p => p.id === selectedProductId);
    setCurrentProduct(product || null);

    let calculatedUnitPrice = product?.preco_unitario || 0;
    let baseProductLineTotal = (product?.preco_total || 0) * (quantity || 0);
    let discountedProductLineTotal = baseProductLineTotal;

    if (discountType === 'percentage' && discountValue !== null) {
      discountedProductLineTotal = baseProductLineTotal * (1 - (discountValue / 100));
    } else if (discountType === 'amount' && discountValue !== null) {
      discountedProductLineTotal = baseProductLineTotal - discountValue;
    }
    discountedProductLineTotal = Math.max(0, discountedProductLineTotal); // Ensure not negative

    setValue(`deal_products.${index}.unit_price_at_deal_time`, calculatedUnitPrice);
    setValue(`deal_products.${index}.total_price_at_deal_time`, discountedProductLineTotal);
    setValue(`deal_products.${index}.product_name`, product?.produto || '');
    setValue(`deal_products.${index}.product_category`, product?.categoria || '');
    
    onProductChange(index, selectedProductId, quantity);
  }, [selectedProductId, quantity, discountType, discountValue, allProducts, index, setValue, onProductChange]);

  const productCategories = Array.from(new Set(allProducts.map(p => p.categoria).filter((cat): cat is string => cat !== null && cat.trim() !== '')));

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border p-4 rounded-md bg-muted/50">
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
            {productCategories.length === 0 ? (
              <SelectItem value="no-categories" disabled>Nenhuma categoria disponível</SelectItem>
            ) : (
              productCategories.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor={`product-id-${index}`}>Produto</Label>
        <Select
          onValueChange={(value) => setValue(`deal_products.${index}.product_id`, value)}
          value={selectedProductId || ''}
          disabled={!productCategory}
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
      <div className="md:col-span-1">
        <Label htmlFor={`discount-type-${index}`}>Desc. Tipo</Label>
        <Select
          onValueChange={(value) => {
            setValue(`deal_products.${index}.discount_type`, value);
            if (value === 'none') setValue(`deal_products.${index}.discount_value`, 0);
          }}
          value={discountType || 'none'}
          disabled={!selectedProductId}
        >
          <SelectTrigger id={`discount-type-${index}`}>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            <SelectItem value="percentage">Percentagem</SelectItem>
            <SelectItem value="amount">Valor Fixo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`discount-value-${index}`}>Desc. Valor</Label>
        <Input
          id={`discount-value-${index}`}
          type="number"
          min="0"
          value={discountValue || 0}
          onChange={(e) => setValue(`deal_products.${index}.discount_value`, Number(e.target.value))}
          disabled={!selectedProductId || discountType === 'none'}
        />
      </div>
      {currentProduct && (
        <div className="md:col-span-5 text-sm text-muted-foreground mt-2">
          <p>Preço Unitário Base: {currentProduct.preco_unitario?.toFixed(2) || '0.00'} €</p>
          <p>Preço Total Base do Produto: {currentProduct.preco_total?.toFixed(2) || '0.00'} €</p>
          <p className={cn("font-semibold", discountType !== 'none' ? "text-green-700" : "")}>
            Valor do Item (c/ Desconto): {((watch(`deal_products.${index}.total_price_at_deal_time`) || 0)).toFixed(2)} €
          </p>
        </div>
      )}
      <div className="flex items-center justify-end md:col-start-6">
        <Button variant="destructive" size="icon" onClick={() => onRemove(index)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DealProductFormItem;