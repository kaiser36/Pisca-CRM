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
  initialProductId?: string | null;
  initialQuantity?: number;
  initialDiscountType?: 'none' | 'percentage' | 'amount' | null;
  initialDiscountValue?: number | null;
}

const DealProductFormItem: React.FC<DealProductFormItemProps> = ({
  index,
  allProducts,
  onRemove,
  initialProductId,
  initialQuantity,
  initialDiscountType,
  initialDiscountValue,
}) => {
  const { watch, setValue, formState: { errors }, trigger } = useFormContext(); // Get errors and trigger from context

  const selectedProductId = watch(`deal_products.${index}.product_id`);
  const quantity = watch(`deal_products.${index}.quantity`);
  const productCategory = watch(`deal_products.${index}.product_category`);
  const discountType = watch(`deal_products.${index}.discount_type`);
  const discountValue = watch(`deal_products.${index}.discount_value`);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Effect 1: Initialize form fields (runs once on mount or when initial props change)
  useEffect(() => {
    // console.log(`[DealProductFormItem ${index}] Effect 1 (init) triggered. initialProductId: ${initialProductId}, initialQuantity: ${initialQuantity}`); // Removed for less console noise
    setValue(`deal_products.${index}.product_id`, initialProductId || '', { shouldDirty: true, shouldValidate: true }); // Ensure empty string for Select
    setValue(`deal_products.${index}.quantity`, initialQuantity || 1, { shouldDirty: true, shouldValidate: true });
    setValue(`deal_products.${index}.discount_type`, initialDiscountType || 'none', { shouldDirty: true, shouldValidate: true });
    setValue(`deal_products.${index}.discount_value`, initialDiscountValue || 0, { shouldDirty: true, shouldValidate: true });

    if (initialProductId) {
      // console.log(`[DealProductFormItem ${index}] Searching for initial product with ID: ${initialProductId}`); // Removed for less console noise
      const product = allProducts.find(p => p.id === initialProductId);
      if (product) {
        setValue(`deal_products.${index}.product_category`, product.categoria || '', { shouldDirty: true, shouldValidate: true }); // Ensure empty string
        // console.log(`[DealProductFormItem ${index}] Initial product found. Setting category: ${product.categoria}`); // Removed for less console noise
      } else {
        setValue(`deal_products.${index}.product_category`, '', { shouldDirty: true, shouldValidate: true }); // Ensure empty string
        // console.log(`[DealProductFormItem ${index}] Initial product ID provided but product not found. Resetting category.`); // Removed for less console noise
      }
    } else {
      setValue(`deal_products.${index}.product_category`, '', { shouldDirty: true, shouldValidate: true }); // Ensure empty string
      // console.log(`[DealProductFormItem ${index}] No initial product ID. Resetting category.`); // Removed for less console noise
    }
  }, [initialProductId, initialQuantity, initialDiscountType, initialDiscountValue, index, setValue, allProducts]);

  // Effect 2: Filter products based on selected category (runs when productCategory or allProducts change)
  useEffect(() => {
    // console.log(`[DealProductFormItem ${index}] Effect 2 (filter) triggered. productCategory: ${productCategory}, All Products Count: ${allProducts.length}`); // Removed for less console noise
    if (productCategory) {
      const newFilteredProducts = allProducts.filter(p => p.categoria === productCategory);
      setFilteredProducts(newFilteredProducts);
      // console.log(`[DealProductFormItem ${index}] Filtered products count for category ${productCategory}: ${newFilteredProducts.length}`); // Removed for less console noise
    } else {
      setFilteredProducts(allProducts);
      // console.log(`[DealProductFormItem ${index}] No category selected. Showing all products: ${allProducts.length}`); // Removed for less console noise
    }
  }, [productCategory, allProducts, index]);

  // Effect 3: Update current product details and calculate total_price_at_deal_time (runs when product selection or quantity/discount changes)
  useEffect(() => {
    // console.log(`[DealProductFormItem ${index}] Effect 3 (calc) triggered. selectedProductId: ${selectedProductId}, quantity: ${quantity}, discountType: ${discountType}, discountValue: ${discountValue}`); // Removed for less console noise
    const product = allProducts.find(p => p.id === selectedProductId);
    setCurrentProduct(product || null);

    let calculatedUnitPrice = product?.preco_unitario || 0;
    let baseProductLineTotal = (product?.preco_unitario || 0) * (quantity || 0);
    let discountedProductLineTotal = baseProductLineTotal;

    if (discountType === 'percentage' && discountValue !== null && discountValue !== undefined) {
      discountedProductLineTotal = baseProductLineTotal * (1 - (discountValue / 100));
    } else if (discountType === 'amount' && discountValue !== null && discountValue !== undefined) {
      discountedProductLineTotal = baseProductLineTotal - discountValue;
    }
    discountedProductLineTotal = Math.max(0, discountedProductLineTotal);

    if (watch(`deal_products.${index}.unit_price_at_deal_time`) !== calculatedUnitPrice) {
      setValue(`deal_products.${index}.unit_price_at_deal_time`, calculatedUnitPrice, { shouldDirty: true, shouldValidate: true });
    }
    if (watch(`deal_products.${index}.total_price_at_deal_time`) !== discountedProductLineTotal) {
      setValue(`deal_products.${index}.total_price_at_deal_time`, discountedProductLineTotal, { shouldDirty: true, shouldValidate: true });
      // Explicitly trigger validation/re-render for the parent form's watched fields
      trigger(`deal_products.${index}.total_price_at_deal_time`);
    }
    if (watch(`deal_products.${index}.product_name`) !== (product?.produto || '')) {
      setValue(`deal_products.${index}.product_name`, product?.produto || '', { shouldDirty: true, shouldValidate: true });
    }
    if (watch(`deal_products.${index}.product_category`) !== (product?.categoria || '')) { // Ensure category is also set
      setValue(`deal_products.${index}.product_category`, product?.categoria || '', { shouldDirty: true, shouldValidate: true });
    }
    
    // console.log(`[DealProductFormItem ${index}] Calculated total price: ${discountedProductLineTotal}`); // Removed for less console noise
  }, [selectedProductId, quantity, discountType, discountValue, allProducts, index, setValue, watch, trigger]);

  const productCategories = Array.from(new Set(allProducts.map(p => p.categoria).filter((cat): cat is string => cat !== null && cat.trim() !== '')));
  // console.log(`[DealProductFormItem ${index}] Available product categories:`, productCategories); // Removed for less console noise

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border p-4 rounded-md bg-muted/50">
      <div className="md:col-span-1">
        <Label htmlFor={`product-category-${index}`}>Categoria</Label>
        <Select
          onValueChange={(value) => {
            // console.log(`[DealProductFormItem ${index}] Category changed to: ${value}`); // Removed for less console noise
            setValue(`deal_products.${index}.product_category`, value, { shouldDirty: true, shouldValidate: true });
            setValue(`deal_products.${index}.product_id`, '', { shouldDirty: true, shouldValidate: true }); // Reset product_id when category changes
          }}
          value={productCategory || ''} // Ensure value is a string, not undefined
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
        {errors.deal_products?.[index]?.product_category && (
          <p className="text-sm font-medium text-destructive mt-1">{errors.deal_products[index]?.product_category?.message}</p>
        )}
      </div>
      <div className="md:col-span-2">
        <Label htmlFor={`product-id-${index}`}>Produto</Label>
        <Select
          onValueChange={(value) => {
            // console.log(`[DealProductFormItem ${index}] Product changed to: ${value}`); // Removed for less console noise
            setValue(`deal_products.${index}.product_id`, value, { shouldDirty: true, shouldValidate: true });
          }}
          value={selectedProductId || ''} // Ensure value is a string, not undefined
          disabled={!productCategory || filteredProducts.length === 0} // Disable if no category or no products
        >
          <SelectTrigger id={`product-id-${index}`}>
            <SelectValue placeholder="Selecione o produto" />
          </SelectTrigger>
          <SelectContent>
            {filteredProducts.length === 0 ? (
              <SelectItem value="no-products-available" disabled>Nenhum produto disponível</SelectItem>
            ) : (
              filteredProducts.map(product => (
                <SelectItem key={product.id} value={product.id}>{product.produto}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.deal_products?.[index]?.product_id && (
          <p className="text-sm font-medium text-destructive mt-1">{errors.deal_products[index]?.product_id?.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor={`quantity-${index}`}>Quantidade</Label>
        <Input
          id={`quantity-${index}`}
          type="number"
          min="1"
          value={quantity || 1}
          onChange={(e) => setValue(`deal_products.${index}.quantity`, Number(e.target.value) || 0, { shouldDirty: true, shouldValidate: true })}
          disabled={!selectedProductId}
        />
        {errors.deal_products?.[index]?.quantity && (
          <p className="text-sm font-medium text-destructive mt-1">{errors.deal_products[index]?.quantity?.message}</p>
        )}
      </div>
      <div className="md:col-span-1">
        <Label htmlFor={`discount-type-${index}`}>Desc. Tipo</Label>
        <Select
          onValueChange={(value) => {
            setValue(`deal_products.${index}.discount_type`, value, { shouldDirty: true, shouldValidate: true });
            if (value === 'none') setValue(`deal_products.${index}.discount_value`, 0, { shouldDirty: true, shouldValidate: true });
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
          onChange={(e) => setValue(`deal_products.${index}.discount_value`, Number(e.target.value) || 0, { shouldDirty: true, shouldValidate: true })}
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