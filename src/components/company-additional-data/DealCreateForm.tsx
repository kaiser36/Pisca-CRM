"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Negocio, Product, DealProduct as DealProductType, Campaign, Account } from '@/types/crm';
import { insertDeal, fetchProducts, fetchCampaigns, fetchCompaniesByExcelCompanyIds, fetchAccounts } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CalendarIcon, PlusCircle, Briefcase, Activity, ShieldAlert, User, FileText, Euro } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DealProductFormItem from './DealProductFormItem';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
  expected_close_date: z.date().nullable().optional(),
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
  assigned_to_am_id: z.string().nullable().optional(),
  assigned_to_am_name: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const DealCreateForm: React.FC<DealCreateFormProps> = ({ companyExcelId, commercialName, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [availableAMs, setAvailableAMs] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyDbId, setCompanyDbId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const [companies, fetchedProducts, fetchedCampaigns, fetchedAMs] = await Promise.all([
          fetchCompaniesByExcelCompanyIds(userId, [companyExcelId]),
          fetchProducts(userId),
          fetchCampaigns(userId),
          fetchAccounts(userId)
        ]);

        const currentCompany = companies.find(c => c.Company_id === companyExcelId);
        if (currentCompany) {
          setCompanyDbId(currentCompany.id || null);
        } else {
          showError(`Empresa com ID Excel '${companyExcelId}' não encontrada.`);
          setCompanyDbId(null);
        }

        setAllProducts(fetchedProducts);
        setAvailableCampaigns(fetchedCampaigns.filter(c => 
          c.is_active && 
          (!c.start_date || !isFuture(parseISO(c.start_date))) &&
          (!c.end_date || !isPast(parseISO(c.end_date)))
        ));
        setAvailableAMs(fetchedAMs);

      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        showError(err.message || "Falha ao carregar dados necessários.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) loadInitialData();
  }, [userId, companyExcelId]);

  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commercial_name: commercialName || '',
      deal_name: '',
      deal_status: 'Prospecting',
      deal_value: 0,
      expected_close_date: undefined,
      priority: 'Medium',
      notes: '',
      deal_products: [{ product_id: '', quantity: 1, unit_price_at_deal_time: 0, total_price_at_deal_time: 0, product_name: '', product_category: '', discount_type: 'none', discount_value: 0 }],
      campaign_id: '',
      discount_type: 'none',
      discount_value: 0,
      final_deal_value: 0,
      assigned_to_am_id: '',
      assigned_to_am_name: '',
    },
  });

  const { watch, setValue, control, handleSubmit, formState: { errors } } = formMethods;

  const { fields, append, remove } = useFieldArray({ control, name: "deal_products" });

  const allProductTotals = fields.map((_, index) => watch(`deal_products.${index}.total_price_at_deal_time`));
  const discountType = watch("discount_type");
  const discountValue = watch("discount_value");
  const selectedCampaignId = watch("campaign_id");
  const assignedToAmId = watch("assigned_to_am_id");

  useEffect(() => {
    if (assignedToAmId && availableAMs.length > 0) {
      const selectedAM = availableAMs.find(am => am.id === assignedToAmId);
      setValue("assigned_to_am_name", selectedAM?.account_name || selectedAM?.am || null);
    } else if (!assignedToAmId) {
      setValue("assigned_to_am_name", null);
    }
  }, [assignedToAmId, availableAMs, setValue]);

  useEffect(() => {
    const campaign = availableCampaigns.find(c => c.id === selectedCampaignId);
    if (campaign && campaign.type === 'discount') {
      setValue("discount_type", campaign.discount_type || 'none');
      setValue("discount_value", campaign.discount_value || 0);
    } else {
      setValue("discount_type", 'none');
      setValue("discount_value", 0);
    }
  }, [selectedCampaignId, availableCampaigns, setValue]);

  useEffect(() => {
    const baseValue = allProductTotals.reduce((sum, total) => sum + (total || 0), 0);
    setValue("deal_value", baseValue);

    let finalValue = baseValue;
    if (discountType === 'percentage' && discountValue != null) {
      finalValue *= (1 - (discountValue / 100));
    } else if (discountType === 'amount' && discountValue != null) {
      finalValue -= discountValue;
    }
    setValue("final_deal_value", Math.max(0, finalValue));
  }, [allProductTotals, discountType, discountValue, setValue]);

  const onSubmit = async (values: FormData) => {
    if (!userId || !companyDbId) {
      showError("Utilizador não autenticado ou empresa inválida.");
      return;
    }
    setIsSubmitting(true);
    try {
      const newDeal: Omit<Negocio, 'id' | 'created_at' | 'updated_at' | 'commercial_name'> = {
        user_id: userId,
        company_excel_id: companyExcelId,
        company_db_id: companyDbId,
        deal_name: values.deal_name,
        deal_status: values.deal_status || 'Prospecting',
        deal_value: values.deal_value || 0,
        currency: 'EUR',
        expected_close_date: values.expected_close_date?.toISOString() || null,
        stage: null,
        priority: values.priority || 'Medium',
        notes: values.notes || null,
        deal_products: values.deal_products as DealProductType[],
        campaign_id: values.campaign_id || null,
        discount_type: values.discount_type || 'none',
        discount_value: values.discount_value || null,
        final_deal_value: values.final_deal_value || null,
        assigned_to_am_id: values.assigned_to_am_id || null,
        assigned_to_am_name: values.assigned_to_am_name || null,
      };
      await insertDeal(newDeal);
      showSuccess("Negócio criado com sucesso!");
      onSave();
    } catch (error: any) {
      showError(error.message || "Falha ao criar o negócio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const amOptions = useMemo(() => availableAMs.map(am => ({
    value: am.id,
    label: am.account_name || am.am || 'N/A'
  })), [availableAMs]);

  const selectedAMDisplayName = useMemo(() => {
    return amOptions.find(opt => opt.value === assignedToAmId)?.label || "Selecione um AM";
  }, [assignedToAmId, amOptions]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Negócio</CardTitle>
            <CardDescription>
              Para a empresa {commercialName || companyExcelId} (ID: {companyExcelId})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={control} name="deal_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Negócio <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} placeholder="Ex: Venda de Plano Premium" className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="deal_status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                    <FormControl>
                      <SelectTrigger>
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Selecione o status" className="pl-10" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="expected_close_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Fecho Esperada</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-10 text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Selecione uma data</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value as Date} onSelect={field.onChange} initialFocus /></PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                    <FormControl>
                      <SelectTrigger>
                        <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Selecione a prioridade" className="pl-10" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Low", "Medium", "High"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="assigned_to_am_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Atribuído a (AM)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <SelectValue className="pl-10">{selectedAMDisplayName}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading ? <SelectItem value="loading" disabled>A carregar AMs...</SelectItem> : amOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="notes" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea {...field} placeholder="Adicione notas relevantes sobre o negócio..." className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Produtos do Negócio</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {fields.map((item, index) => (
              <DealProductFormItem key={item.id} index={index} allProducts={allProducts} onRemove={remove} />
            ))}
            <Button type="button" variant="outline" onClick={() => append({ product_id: '', quantity: 1, unit_price_at_deal_time: 0, total_price_at_deal_time: 0, product_name: '', product_category: '', discount_type: 'none', discount_value: 0 })} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
            </Button>
            {errors.deal_products && <p className="text-sm font-medium text-destructive mt-2">{errors.deal_products.message || errors.deal_products.root?.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumo e Desconto Geral</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={control} name="deal_value" render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Base</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} readOnly className="pl-10 font-semibold" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={control} name="campaign_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Campanha Aplicada</FormLabel>
                <Select onValueChange={v => field.onChange(v === "null-campaign" ? null : v)} value={field.value || "null-campaign"}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma campanha" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="null-campaign">Nenhuma Campanha</SelectItem>
                    {availableCampaigns.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={control} name="discount_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Desconto Geral</FormLabel>
                <Select onValueChange={field.onChange} value={field.value!} disabled={!!selectedCampaignId}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="percentage">Percentagem (%)</SelectItem>
                    <SelectItem value="amount">Valor Fixo (€)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {watch("discount_type") !== 'none' && (
              <FormField control={control} name="discount_value" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Desconto Geral</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} disabled={!!selectedCampaignId} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <FormField control={control} name="final_deal_value" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Valor Final do Negócio</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translatey-1/2 h-5 w-5 text-green-600" />
                    <Input {...field} readOnly className="pl-10 text-lg font-bold text-green-600 border-2 border-gray-300" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || isLoading || !userId || !companyDbId || !formMethods.formState.isValid}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A Criar...</> : "Criar Negócio"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default DealCreateForm;