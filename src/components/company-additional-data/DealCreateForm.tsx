"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Negocio, Product, DealProduct as DealProductType } from '@/types/crm';
import { insertDeal, fetchProducts } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CalendarIcon, PlusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DealProductFormItem from './DealProductFormItem'; // NEW: Import the new component

interface DealCreateFormProps {
  companyExcelId: string;
  commercialName?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const dealProductSchema = z.object({
  product_id: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number().int("Deve ser um número inteiro").min(1, "A quantidade deve ser pelo menos 1"),
  unit_price_at_deal_time: z.number().nullable().optional(),
  total_price_at_deal_time: z.number().nullable().optional(), // This will be the discounted total for the line item
  product_name: z.string().nullable().optional(),
  product_category: z.string().nullable().optional(),
  discount_type: z.enum(['none', 'percentage', 'amount']).default('none'), // NEW
  discount_value: z.preprocess( // NEW
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "O desconto não pode ser negativo").nullable().optional()
  ),
});

const formSchema = z.object({
  commercial_name: z.string().nullable().optional(),
  deal_name: z.string().min(1, "Nome do Negócio é obrigatório"),
  deal_status: z.string().nullable().optional(),
  deal_value: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ),
  currency: z.string().nullable().optional(),
  expected_close_date: z.date().nullable().optional(),
  stage: z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  deal_products: z.array(dealProductSchema).min(1, "Pelo menos um produto é obrigatório para o negócio."),
  discount_type: z.enum(['none', 'percentage', 'amount']).default('none'),
  discount_value: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "O desconto não pode ser negativo").nullable().optional()
  ),
  final_deal_value: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "O valor final não pode ser negativo").nullable().optional()
  ),
});

type FormData = z.infer<typeof formSchema>;

const DealCreateForm: React.FC<DealCreateFormProps> = ({ companyExcelId, commercialName, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

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

  useEffect(() => {
    const loadProducts = async () => {
      if (!userId) return;
      try {
        const fetchedProducts = await fetchProducts(userId);
        setAllProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Erro ao carregar produtos:", err);
        showError(err.message || "Falha ao carregar a lista de produtos.");
      }
    };

    if (userId) {
      loadProducts();
    }
  }, [userId]);

  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commercial_name: commercialName || '',
      deal_name: '',
      deal_status: 'Prospecting',
      deal_value: 0,
      currency: 'EUR',
      expected_close_date: undefined,
      stage: '',
      priority: 'Medium',
      notes: '',
      deal_products: [], // Initialize with an empty array
      discount_type: 'none',
      discount_value: 0,
      final_deal_value: 0,
    },
  });

  const { watch, setValue, control, handleSubmit, formState: { errors } } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "deal_products",
  });

  const discountType = watch("discount_type");
  const discountValue = watch("discount_value");
  const dealProducts = watch("deal_products");

  // Effect to calculate deal_value and final_deal_value
  useEffect(() => {
    // deal_value é a soma de total_price_at_deal_time de cada produto, que já inclui descontos individuais
    const calculatedBaseDealValue = dealProducts.reduce((sum, item) => {
      return sum + (item.total_price_at_deal_time || 0);
    }, 0);
    setValue("deal_value", calculatedBaseDealValue);

    let finalValue = calculatedBaseDealValue;
    if (discountType === 'percentage' && discountValue !== null) {
      finalValue = calculatedBaseDealValue * (1 - (discountValue / 100));
    } else if (discountType === 'amount' && discountValue !== null) {
      finalValue = calculatedBaseDealValue - discountValue;
    }
    setValue("final_deal_value", Math.max(0, finalValue));
  }, [dealProducts, discountType, discountValue, setValue]);

  const handleAddProduct = () => {
    append({ product_id: '', quantity: 1, unit_price_at_deal_time: 0, total_price_at_deal_time: 0, product_name: '', product_category: '', discount_type: 'none', discount_value: 0 });
  };

  // REMOVIDO: handleProductItemChange function

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar o negócio.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newDeal: Omit<Negocio, 'id' | 'created_at' | 'updated_at' | 'commercial_name'> = {
        user_id: userId,
        company_excel_id: companyExcelId,
        deal_name: values.deal_name,
        deal_status: values.deal_status || 'Prospecting',
        deal_value: values.deal_value || 0,
        currency: values.currency || 'EUR',
        expected_close_date: values.expected_close_date ? values.expected_close_date.toISOString() : null,
        stage: values.stage || null,
        priority: values.priority || 'Medium',
        notes: values.notes || null,
        deal_products: values.deal_products as DealProductType[],
        discount_type: values.discount_type || null,
        discount_value: values.discount_value || null,
        final_deal_value: values.final_deal_value || null,
      };

      await insertDeal(newDeal);
      showSuccess("Negócio criado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar negócio:", error);
      showError(error.message || "Falha ao criar o negócio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainFields = [
    { name: "commercial_name", label: "Nome Comercial da Empresa", type: "text", readOnly: true },
    { name: "deal_name", label: "Nome do Negócio", type: "text", required: true },
    { name: "deal_status", label: "Status", type: "select", options: ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"] },
    { name: "currency", label: "Moeda", type: "select", options: ["EUR", "USD", "GBP"] },
    { name: "expected_close_date", label: "Data de Fecho Esperada", type: "date" },
    { name: "stage", label: "Etapa", type: "text" },
    { name: "priority", label: "Prioridade", type: "select", options: ["Low", "Medium", "High"] },
    { name: "notes", label: "Notas", type: "textarea", colSpan: 2 },
  ];

  const discountFields = [
    { name: "deal_value", label: "Valor do Negócio (Pré-Desconto Geral)", type: "number", readOnly: true },
    { name: "discount_type", label: "Tipo de Desconto Geral", type: "select", options: [{ value: 'none', label: 'Nenhum' }, { value: 'percentage', label: 'Percentagem' }, { value: 'amount', label: 'Valor Fixo' }] },
    { name: "discount_value", label: "Valor do Desconto Geral", type: "number", conditional: (val: FormData) => val.discount_type !== 'none' },
    { name: "final_deal_value", label: "Valor Final do Negócio", type: "number", readOnly: true },
  ];

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A criar negócio para a empresa com ID Excel: <span className="font-semibold">{companyExcelId}</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mainFields.map((field) => (
            <FormField
              key={field.name}
              control={control}
              name={field.name as keyof FormData}
              render={({ field: formField }) => (
                <FormItem className={field.colSpan === 2 ? "md:col-span-2" : ""}>
                  <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    {field.type === "date" ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formField.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formField.value ? format(formField.value as Date, "PPP") : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formField.value as Date}
                            onSelect={formField.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        {...formField}
                        value={formField.value as string || ''}
                        onChange={formField.onChange}
                      />
                    ) : field.type === "select" ? (
                      <Select onValueChange={(value) => {
                        formField.onChange(value);
                        if (field.name === "discount_type" && value === 'none') {
                          setValue("discount_value", 0);
                        }
                      }} defaultValue={formField.value as string}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecione um ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option: any) => (
                            <SelectItem key={option.value || option} value={option.value || option}>{option.label || option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        {...formField}
                        value={formField.value as string | number || ''}
                        onChange={(e) => {
                          if (field.type === "number") {
                            formField.onChange(e.target.value === '' ? null : Number(e.target.value));
                          } else {
                            formField.onChange(e.target.value);
                          }
                        }}
                        readOnly={field.readOnly}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Produtos do Negócio</h3>
        <div className="space-y-4">
          {fields.map((item, index) => (
            <DealProductFormItem
              key={item.id}
              index={index}
              allProducts={allProducts}
              onRemove={remove}
              // onProductChange={handleProductItemChange} // REMOVIDO
              initialProductId={item.product_id}
              initialQuantity={item.quantity}
              initialDiscountType={item.discount_type}
              initialDiscountValue={item.discount_value}
            />
          ))}
          <Button type="button" variant="outline" onClick={handleAddProduct} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
          </Button>
          {errors.deal_products && <p className="text-sm font-medium text-destructive mt-2">{errors.deal_products.message}</p>}
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Resumo e Desconto Geral</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discountFields.map((field) => {
            if (field.conditional && !formMethods.getValues().deal_products.length) { // Apenas mostra campos de desconto se houver produtos
              return null;
            }
            if (field.conditional && !field.conditional(formMethods.getValues())) {
              return null;
            }
            return (
              <FormField
                key={field.name}
                control={control}
                name={field.name as keyof FormData}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === "select" ? (
                        <Select onValueChange={(value) => {
                          formField.onChange(value);
                          if (field.name === "discount_type" && value === 'none') {
                            setValue("discount_value", 0);
                          }
                        }} defaultValue={formField.value as string}>
                          <SelectTrigger>
                            <SelectValue placeholder={`Selecione um ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option: any) => (
                              <SelectItem key={option.value || option} value={option.value || option}>{option.label || option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          {...formField}
                          value={formField.value as string | number || ''}
                          onChange={(e) => {
                            if (field.type === "number") {
                              formField.onChange(e.target.value === '' ? null : Number(e.target.value));
                            } else {
                              formField.onChange(e.target.value);
                            }
                          }}
                          readOnly={field.readOnly}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !userId || !formMethods.formState.isValid}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Criar...
              </>
            ) : (
              "Criar Negócio"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default DealCreateForm;