"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Analytics, Company, CompanyAdditionalExcelData, Campaign } from '@/types/crm'; // NEW: Import Campaign
import { insertAnalytics, fetchCompaniesByExcelCompanyIds, fetchCompanyAdditionalExcelData } from '@/integrations/supabase/utils';
import { fetchCampaigns } from '@/integrations/supabase/services/campaignService'; // CORRECTED: Import fetchCampaigns from campaignService
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/context/SessionContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsCreateFormProps {
  companyExcelId: string;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().nullable().optional(),
  analysis_date: z.date().nullable().optional(),
  category: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  start_date: z.date().nullable().optional(),
  end_date: z.date().nullable().optional(),
  views: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  clicks: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  phone_views: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  whatsapp_interactions: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  leads_email: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  location_clicks: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  total_ads: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  favorites: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  total_cost: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ),
  revenue: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ),
  phone_views_percentage: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").max(100, "Não pode ser superior a 100").nullable().optional()
  ),
  whatsapp_interactions_percentage: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").max(100, "Não pode ser superior a 100").nullable().optional()
  ),
  total_leads: z.number().nullable().optional(),
  campaign_id: z.string().nullable().optional(), // NEW: Add campaign_id to schema
});

type FormData = z.infer<typeof formSchema>;

const AnalyticsCreateForm: React.FC<AnalyticsCreateFormProps> = ({ companyExcelId, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyDbId, setCompanyDbId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [additionalCompanyDetails, setAdditionalCompanyDetails] = useState<CompanyAdditionalExcelData | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]); // NEW: State for campaigns
  const { profile } = useSession();

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      analysis_date: new Date(),
      category: '',
      result: '',
      start_date: undefined,
      end_date: undefined,
      views: 0,
      clicks: 0,
      phone_views: 0,
      whatsapp_interactions: 0,
      leads_email: 0,
      location_clicks: 0,
      total_ads: 0,
      favorites: 0,
      total_cost: 0,
      revenue: 0,
      phone_views_percentage: profile?.phone_views_conversion_percentage ?? 100,
      whatsapp_interactions_percentage: profile?.whatsapp_interactions_conversion_percentage ?? 100,
      total_leads: 0,
      campaign_id: null, // NEW: Set default campaign_id
    },
  });

  const { watch, setValue } = form;
  const phoneViews = watch("phone_views");
  const whatsappInteractions = watch("whatsapp_interactions");
  const leadsEmail = watch("leads_email");
  const phoneViewsPercentage = watch("phone_views_percentage");
  const whatsappInteractionsPercentage = watch("whatsapp_interactions_percentage");

  // Effect to calculate total_leads
  useEffect(() => {
    const calculatedLeads = 
      ((phoneViews || 0) * (phoneViewsPercentage ?? 100) / 100) +
      ((whatsappInteractions || 0) * (whatsappInteractionsPercentage ?? 100) / 100) +
      (leadsEmail || 0);
    setValue("total_leads", calculatedLeads);
  }, [phoneViews, whatsappInteractions, leadsEmail, phoneViewsPercentage, whatsappInteractionsPercentage, setValue]);

  useEffect(() => {
    const loadCompanyAndCampaignData = async () => { // Renamed function
      if (!userId || !companyExcelId) return;
      try {
        const companies = await fetchCompaniesByExcelCompanyIds(userId, [companyExcelId]);
        const currentCompany = companies.find(c => c.Company_id === companyExcelId);
        setCompanyDetails(currentCompany || null);
        setCompanyDbId(currentCompany?.id || null);

        const { data: additionalData } = await fetchCompanyAdditionalExcelData(userId, 1, 1, companyExcelId);
        const currentAdditionalData = additionalData.find(c => c.excel_company_id === companyExcelId);
        setAdditionalCompanyDetails(currentAdditionalData || null);

        // NEW: Fetch campaigns
        const fetchedCampaigns = await fetchCampaigns(userId);
        setCampaigns(fetchedCampaigns);

      } catch (err: any) {
        console.error("Erro ao carregar dados da empresa ou campanhas para o formulário de análise:", err);
        showError(err.message || "Falha ao carregar dados da empresa ou campanhas.");
      }
    };

    if (userId) {
      loadCompanyAndCampaignData();
    }
  }, [userId, companyExcelId]);

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar a análise.");
      return;
    }
    if (!companyDbId) {
      showError("Não foi possível associar a análise a uma empresa válida. Por favor, verifique o ID Excel da empresa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newAnalytics: Omit<Analytics, 'id' | 'created_at' | 'updated_at'> = { // ADDED 'updated_at' to Omit
        user_id: userId,
        company_db_id: companyDbId,
        company_excel_id: companyExcelId,
        title: values.title,
        description: values.description || null,
        analysis_date: values.analysis_date ? values.analysis_date.toISOString() : null,
        category: values.category || null,
        result: values.result || null,
        start_date: values.start_date ? values.start_date.toISOString() : null,
        end_date: values.end_date ? values.end_date.toISOString() : null,
        views: values.views || null,
        clicks: values.clicks || null,
        phone_views: values.phone_views || null,
        whatsapp_interactions: values.whatsapp_interactions || null,
        leads_email: values.leads_email || null,
        location_clicks: values.location_clicks || null,
        total_ads: values.total_ads || null,
        favorites: values.favorites || null,
        total_cost: values.total_cost || null,
        revenue: values.revenue || null,
        phone_views_percentage: values.phone_views_percentage || null,
        whatsapp_interactions_percentage: values.whatsapp_interactions_percentage || null,
        total_leads: values.total_leads || null,
        campaign_id: values.campaign_id || null, // NEW
      };

      await insertAnalytics(newAnalytics);
      showSuccess("Análise criada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar análise:", error);
      showError(error.message || "Falha ao criar a análise.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "category", label: "Categoria", type: "select", options: ["Financeira", "Marketing", "Operacional", "Vendas", "Outro"] },
    { name: "campaign_id", label: "Campanha", type: "select-campaign", options: campaigns }, // NEW: Campaign select field
    { name: "analysis_date", label: "Data da Análise", type: "date" },
    { name: "start_date", label: "Data de Início", type: "date" },
    { name: "end_date", label: "Data de Fim", type: "date" },
    { name: "views", label: "Visualizações", type: "number" },
    { name: "clicks", label: "Cliques", type: "number" },
    { name: "phone_views", label: "Visualizações do Telefone", type: "number" },
    { name: "phone_views_percentage", label: "Conversão Tel. (%)", type: "number" },
    { name: "whatsapp_interactions", label: "Interações WhatsApp", type: "number" },
    { name: "whatsapp_interactions_percentage", label: "Conversão Whats. (%)", type: "number" },
    { name: "leads_email", label: "Leads (email)", type: "number" },
    { name: "total_leads", label: "Total de Leads", type: "number", readOnly: true },
    { name: "location_clicks", label: "Cliques na Localização", type: "number" },
    { name: "total_ads", label: "Total de Anúncios", type: "number" },
    { name: "favorites", label: "Favoritos", type: "number" },
    { name: "total_cost", label: "Custo Total (€)", type: "number" },
    { name: "revenue", label: "Receita (€)", type: "number" },
    { name: "description", label: "Descrição", type: "textarea", colSpan: 2 },
    { name: "result", label: "Resultado", type: "textarea", colSpan: 2 },
  ];

  const companyDisplayName = additionalCompanyDetails?.["Nome Comercial"] && additionalCompanyDetails["Nome Comercial"].trim() !== ''
    ? additionalCompanyDetails["Nome Comercial"]
    : (companyDetails?.Commercial_Name && companyDetails.Commercial_Name.trim() !== ''
      ? companyDetails.Commercial_Name
      : (companyDetails?.Company_Name ? `${companyDetails.Company_Name} (Nome Fiscal)` : companyExcelId));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A criar análise para a empresa <span className="font-semibold">{companyDisplayName}</span> (ID Excel: <span className="font-semibold">{companyExcelId}</span>)
        </p>
        {!companyDbId && (
          <p className="text-sm text-red-500">
            Não foi possível encontrar a empresa no CRM principal com o ID Excel fornecido. A análise não poderá ser criada.
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
                    ) : field.type === "select-campaign" ? (
                      <Select onValueChange={formField.onChange} value={formField.value as string || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma campanha" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhuma Campanha</SelectItem>
                          {campaigns.map(campaign => (
                            <SelectItem key={campaign.id} value={campaign.id!}>{campaign.name}</SelectItem>
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
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !userId || !companyDbId || !form.formState.isValid}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Criar...
              </>
            ) : (
              "Criar Análise"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AnalyticsCreateForm;