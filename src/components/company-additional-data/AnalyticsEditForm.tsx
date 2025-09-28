"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Analytics, Company, CompanyAdditionalExcelData } from '@/types/crm';
import { updateAnalytics, fetchCompaniesByExcelCompanyIds, fetchCompanyAdditionalExcelData } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsEditFormProps {
  analytics: Analytics;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().nullable().optional(),
  analysis_date: z.date().nullable().optional(),
  category: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  start_date: z.date().nullable().optional(), // NEW
  end_date: z.date().nullable().optional(),   // NEW
  views: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  clicks: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  phone_views: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  whatsapp_interactions: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  leads_email: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  location_clicks: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  total_ads: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  favorites: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  total_cost: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
  revenue: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ), // NEW
});

type FormData = z.infer<typeof formSchema>;

const AnalyticsEditForm: React.FC<AnalyticsEditFormProps> = ({ analytics, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyDbId, setCompanyDbId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [additionalCompanyDetails, setAdditionalCompanyDetails] = useState<CompanyAdditionalExcelData | null>(null);

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
    const loadCompanyData = async () => {
      if (!userId || !analytics.company_excel_id) return;
      try {
        const companies = await fetchCompaniesByExcelCompanyIds(userId, [analytics.company_excel_id]);
        const currentCompany = companies.find(c => c.Company_id === analytics.company_excel_id);
        setCompanyDetails(currentCompany || null);
        setCompanyDbId(currentCompany?.id || null);

        const { data: additionalData } = await fetchCompanyAdditionalExcelData(userId, 1, 1, analytics.company_excel_id);
        const currentAdditionalData = additionalData.find(c => c.excel_company_id === analytics.company_excel_id);
        setAdditionalCompanyDetails(currentAdditionalData || null);
      } catch (err: any) {
        console.error("Erro ao carregar dados da empresa para o formulário de análise:", err);
        showError(err.message || "Falha ao carregar dados da empresa.");
      }
    };

    if (userId) {
      loadCompanyData();
    }
  }, [userId, analytics.company_excel_id]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: analytics.title || '',
      description: analytics.description || '',
      analysis_date: analytics.analysis_date ? parseISO(analytics.analysis_date) : undefined,
      category: analytics.category || '',
      result: analytics.result || '',
      start_date: analytics.start_date ? parseISO(analytics.start_date) : undefined, // NEW
      end_date: analytics.end_date ? parseISO(analytics.end_date) : undefined,     // NEW
      views: analytics.views || 0,           // NEW
      clicks: analytics.clicks || 0,         // NEW
      phone_views: analytics.phone_views || 0, // NEW
      whatsapp_interactions: analytics.whatsapp_interactions || 0, // NEW
      leads_email: analytics.leads_email || 0, // NEW
      location_clicks: analytics.location_clicks || 0, // NEW
      total_ads: analytics.total_ads || 0,   // NEW
      favorites: analytics.favorites || 0,   // NEW
      total_cost: analytics.total_cost || 0, // NEW
      revenue: analytics.revenue || 0,       // NEW
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }
    if (!companyDbId) {
      showError("Não foi possível associar a análise a uma empresa válida. Por favor, verifique o ID Excel da empresa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedAnalytics: Partial<Omit<Analytics, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'company_excel_id'>> = {
        title: values.title,
        description: values.description || null,
        analysis_date: values.analysis_date ? values.analysis_date.toISOString() : null,
        category: values.category || null,
        result: values.result || null,
        company_db_id: companyDbId,
        start_date: values.start_date ? values.start_date.toISOString() : null, // NEW
        end_date: values.end_date ? values.end_date.toISOString() : null,     // NEW
        views: values.views || null,           // NEW
        clicks: values.clicks || null,         // NEW
        phone_views: values.phone_views || null, // NEW
        whatsapp_interactions: values.whatsapp_interactions || null, // NEW
        leads_email: values.leads_email || null, // NEW
        location_clicks: values.location_clicks || null, // NEW
        total_ads: values.total_ads || null,   // NEW
        favorites: values.favorites || null,   // NEW
        total_cost: values.total_cost || null, // NEW
        revenue: values.revenue || null,       // NEW
      };

      await updateAnalytics(analytics.id!, updatedAnalytics);
      showSuccess("Análise atualizada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar análise:", error);
      showError(error.message || "Falha ao atualizar a análise.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "category", label: "Categoria", type: "select", options: ["Financeira", "Marketing", "Operacional", "Vendas", "Outro"] },
    { name: "analysis_date", label: "Data da Análise", type: "date" },
    { name: "start_date", label: "Data de Início", type: "date" }, // NEW
    { name: "end_date", label: "Data de Fim", type: "date" },     // NEW
    { name: "views", label: "Visualizações", type: "number" },           // NEW
    { name: "clicks", label: "Cliques", type: "number" },         // NEW
    { name: "phone_views", label: "Visualizações do Telefone", type: "number" }, // NEW
    { name: "whatsapp_interactions", label: "Interações WhatsApp", type: "number" }, // NEW
    { name: "leads_email", label: "Leads (email)", type: "number" }, // NEW
    { name: "location_clicks", label: "Cliques na Localização", type: "number" }, // NEW
    { name: "total_ads", label: "Total de Anúncios", type: "number" },   // NEW
    { name: "favorites", label: "Favoritos", type: "number" },   // NEW
    { name: "total_cost", label: "Custo Total (€)", type: "number" }, // NEW
    { name: "revenue", label: "Receita (€)", type: "number" },       // NEW
    { name: "description", label: "Descrição", type: "textarea", colSpan: 2 },
    { name: "result", label: "Resultado", type: "textarea", colSpan: 2 },
  ];

  const companyDisplayName = additionalCompanyDetails?.["Nome Comercial"] && additionalCompanyDetails["Nome Comercial"].trim() !== ''
    ? additionalCompanyDetails["Nome Comercial"]
    : (companyDetails?.Commercial_Name && companyDetails.Commercial_Name.trim() !== ''
      ? companyDetails.Commercial_Name
      : (companyDetails?.Company_Name ? `${companyDetails.Company_Name} (Nome Fiscal)` : analytics.company_excel_id));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A editar análise para a empresa <span className="font-semibold">{companyDisplayName}</span> (ID Excel: <span className="font-semibold">{analytics.company_excel_id}</span>)
        </p>
        {!companyDbId && (
          <p className="text-sm text-red-500">
            Não foi possível encontrar a empresa no CRM principal com o ID Excel fornecido. A análise não poderá ser atualizada.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
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
                      <Select onValueChange={formField.onChange} defaultValue={formField.value as string}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecione uma ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
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
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !userId || !companyDbId || !form.formState.isValid}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Guardar...
              </>
            ) : (
              "Guardar Alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AnalyticsEditForm;