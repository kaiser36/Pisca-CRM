"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Negocio, Product, DealProduct as DealProductType, Campaign } from '@/types/crm';
import { updateDeal, fetchProducts, fetchCampaigns, fetchCompaniesByExcelCompanyIds } from '@/integrations/supabase/utils'; // Import fetchCompaniesByExcelCompanyIds
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CalendarIcon, PlusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isPast, isFuture } from 'date-fns'; // Import isFuture
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DealProductFormItem from './DealProductFormItem';

interface DealEditFormProps {
  deal: Negocio;
  onSave: () => void;
  onCancel: () => void;
}

const dealProductSchema = z.object({
  product_id: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number().int("Deve ser um número inteiro").min(1, "A quantidade deve ser pelo menos 1"),
  unit_price_at_deal_time: z.number().nullable().optional(),
  total_price_at_deal_time: z.number().nullable().optional(),
  product_name: z.string().nullable().optional(),
  product_category: z.string().nullable().optional(),
  discount_type: z.enum(['none', 'percentage', 'amount']).default('none'),
  discount_value: z.preprocess(
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
  campaign_id: z.string().nullable().optional(),
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

const DealEditForm: React.FC<DealEditFormProps> = ({ deal, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [companyDbId, setCompanyDbId] = useState<string | null>(null); // NEW: State for company_db_id

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
    const loadProductsAndCampaigns = async () => {
      if (!userId) return;
      try {
        // NEW: Fetch company_db_id
        const companies = await fetchCompaniesByExcelCompanyIds(userId, [deal.company_excel_id]);
        const currentCompany = companies.find(c => c.Company_id === deal.company_excel_id);
        if (currentCompany) {
          setCompanyDbId(currentCompany.id || null);
        } else {
          showError(`Empresa com ID Excel '${deal.company_excel_id}' não encontrada no CRM principal.`);
          setCompanyDbId(null);
        }

        const fetchedProducts = await fetchProducts(userId);
        setAllProducts(fetchedProducts);
        const fetchedCampaigns = await fetchCampaigns(userId);
        // Filter active campaigns that have started and not expired
        setAvailableCampaigns(fetchedCampaigns.filter(c => 
          c.is_active && 
          (!c.start_date || !isFuture(parseISO(c.start_date))) && // Campaign has started or no start date
          (!c.end_date || !isPast(parseISO(c.end_date))) // Campaign has not expired or no end date
        ));
      } catch (err: any) {
        console.error("Erro ao carregar produtos ou campanhas:", err);
        showError(err.message || "Falha ao carregar a lista de produtos ou campanhas.");
      }
    };

    if (userId) {
      loadProductsAndCampaigns();
    }
  }, [userId, deal.company_excel_id]); // Added deal.company_excel_id to dependencies

  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commercial_name: deal.commercial_name || '',
      deal_name: deal.deal_name || '',
      deal_status: deal.deal_status || 'Prospecting',
      deal_value: deal.deal_value || 0,
      currency: deal.currency || 'EUR',
      expected_close_date: deal.expected_close_date ? parseISO(deal.expected_close_date) : undefined,
      stage: deal.stage || '',
      priority: deal.priority || 'Medium',
      notes: deal.notes || '',
      deal_products: deal.deal_products || [],
      campaign_id: deal.campaign_id || '',
      discount_type: deal.discount_type || 'none',
      discount_value: deal.discount_value || 0,
      final_deal_value: deal.final_deal_value || 0,
    },
  });

  const { watch, setValue, control, handleSubmit, formState: { errors } } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "deal_products",
  });

  const allProductTotals = fields.map((field, index) => watch(`deal_products.${index}.total_price_at_deal_time`));
  const discountType = watch("discount_type");
  const discountValue = watch("discount_value");
  const selectedCampaignId = watch("campaign_id");

  useEffect(() => {
    if (selectedCampaignId) {
      const campaign = availableCampaigns.find(c => c.id === selectedCampaignId);
      // Validate campaign before applying discount
      if (campaign && campaign.type === 'discount' && campaign.is_active && 
          (!campaign.start_date || !isFuture(parseISO(campaign.start_date))) &&
          (!campaign.end_date || !isPast(parseISO(campaign.end_date)))) {
        setValue("discount_type", campaign.discount_type || 'none', { shouldDirty: true, shouldValidate: true });
        setValue("discount_value", campaign.discount_value || 0, { shouldDirty: true, shouldValidate: true });
      } else {
        // If campaign is invalid or not found, reset discount fields and campaign_id
        setValue("campaign_id", '', { shouldDirty: true, shouldValidate: true });
        setValue("discount_type", 'none', { shouldDirty: true, shouldValidate: true });
        setValue("discount_value", 0, { shouldDirty: true, shouldValidate: true });
        if (selectedCampaignId) { // Only show error if a campaign was actually selected and became invalid
          showError("A campanha selecionada não é válida ou está inativa.");
        }
      }
    } else {
      // If no campaign selected, ensure manual discount is still respected or reset if it was from a campaign
      setValue("discount_type", 'none', { shouldDirty: true, shouldValidate: true });
      setValue("discount_value", 0, { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedCampaignId, availableCampaigns, setValue]);
  
  useEffect(() => {
    console.log("[DealEditForm] Parent useEffect triggered for deal calculation.");

    const calculatedBaseDealValue = allProductTotals.reduce((sum, total) => {
      return sum + (total || 0);
    }, 0);

    if (formMethods.getValues("deal_value") !== calculatedBaseDealValue) {
      setValue("deal_value", calculatedBaseDealValue, { shouldDirty: true, shouldValidate: true });
      console.log("[DealEditForm] Calculated Base Deal Value:", calculatedBaseDealValue);
    }

    let finalValue = calculatedBaseDealValue;
    if (discountType === 'percentage' && discountValue !== null) {
      finalValue = calculatedBaseDealValue * (1 - (discountValue / 100));
    } else if (discountType === 'amount' && discountValue !== null) {
      finalValue = calculatedBaseDealValue - discountValue;
    }
    finalValue = Math.max(0, finalValue);

    if (formMethods.getValues("final_deal_value") !== finalValue) {
      setValue("final_deal_value", finalValue, { shouldDirty: true, shouldValidate: true });
      console.log("[DealEditForm] Calculated Final Deal Value:", finalValue);
    }
  }, [allProductTotals, discountType, discountValue, setValue, formMethods]);

  const handleAddProduct = () => {
    append({ product_id: '', quantity: 1, unit_price_at_deal_time: 0, total_price_at_deal_time: 0, product_name: '', product_category: '', discount_type: 'none', discount_value: 0 });
  };

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }
    if (!companyDbId) { // NEW: Check if companyDbId is available
      showError("Não foi possível associar o negócio a uma empresa válida. Por favor, verifique o ID Excel da empresa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedDeal: Partial<Omit<Negocio, 'id' | 'created_at' | 'user_id' | 'commercial_name'>> & { deal_products?: DealProductType[] } = {
        deal_name: values.deal_name,
        deal_status: values.deal_status || 'Prospecting',
        deal_value: values.deal_value || 0,
        currency: values.currency || 'EUR',
        expected_close_date: values.expected_close_date ? values.expected_close_date.toISOString() : null,
        stage: values.stage || null,
        priority: values.priority || 'Medium',
        notes: values.notes || null,
        deal_products: values.deal_products as DealProductType[],
        campaign_id: values.campaign_id || null,
        discount_type: values.discount_type || null,
        discount_value: values.discount_value || null,
        final_deal_value: values.final_deal_value || null,
        company_db_id: companyDbId, // NEW: Include company_db_id
      };

      await updateDeal(deal.id!, updatedDeal);
      showSuccess("Negócio atualizado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar negócio:", error);
      showError(error.message || "Falha ao atualizar o negócio.");
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
    { name: "campaign_id", label: "Campanha Aplicada", type: "select", options: availableCampaigns.map(c => ({ value: c.id, label: c.name })), placeholder: "Selecione uma campanha" },
    { name: "discount_type", label: "Tipo de Desconto Geral", type: "select", options: [{ value: 'none', label: 'Nenhum' }, { value: 'percentage', label: 'Percentagem' }, { value: 'amount', label: 'Valor Fixo' }], readOnly: !!selectedCampaignId },
    { name: "discount_value", label: "Valor do Desconto Geral", type: "number", conditional: (val: FormData) => val.discount_type !== 'none', readOnly: !!selectedCampaignId },
    { name: "final_deal_value", label: "Valor Final do Negócio", type: "number", readOnly: true },
  ];

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A editar negócio para a empresa com ID Excel: <span className="font-semibold">{deal.company_excel_id}</span>
        </p>
        {!companyDbId && ( // NEW: Alert if companyDbId is missing
          <p className="text-sm text-red-500">
            Não foi possível encontrar a empresa no CRM principal com o ID Excel fornecido. O negócio não poderá ser atualizado.
          </p>
        )}
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
            if (field.conditional && !fields.length) {
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
                          formField.onChange(value === "null-campaign" ? null : value);
                          if (field.name === "discount_type" && value === 'none') {
                            setValue("discount_value", 0);
                          }
                        }} value={formField.value as string || "null-campaign"} disabled={field.readOnly}>
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.name === "campaign_id" && <SelectItem value="null-campaign">Nenhuma Campanha</SelectItem>}
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
          <Button type="submit" disabled={isSubmitting || !userId || !companyDbId || !formMethods.formState.isValid}>
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

export default DealEditForm;