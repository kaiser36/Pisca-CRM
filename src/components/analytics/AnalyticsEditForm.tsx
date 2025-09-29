"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useSession } from '@/context/SessionContext';
import { updateAnalytic, fetchCompaniesWithStands, fetchCampaigns } from '@/integrations/supabase/utils';
import { Analytics as AnalyticsType, Company } from '@/types/crm';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  company_db_id: z.string().min(1, "Selecione uma empresa"),
  campaign_id: z.string().nullable().optional(),
  title: z.string().min(1, "O nome da campanha é obrigatório"),
  description: z.string().optional(),
  start_date: z.date({ required_error: "A data de início é obrigatória" }),
  end_date: z.date({ required_error: "A data de fim é obrigatória" }),
  views: z.coerce.number().int().nonnegative().optional(),
  clicks: z.coerce.number().int().nonnegative().optional(),
  phone_views: z.coerce.number().int().nonnegative().optional(),
  whatsapp_interactions: z.coerce.number().int().nonnegative().optional(),
  leads_email: z.coerce.number().int().nonnegative().optional(),
  location_clicks: z.coerce.number().int().nonnegative().optional(),
  total_ads: z.coerce.number().int().nonnegative().optional(),
  favorites: z.coerce.number().int().nonnegative().optional(),
  total_cost: z.coerce.number().nonnegative().optional(),
  revenue: z.coerce.number().nonnegative().optional(),
});

interface AnalyticsEditFormProps {
  analytic: AnalyticsType;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
}

const AnalyticsEditForm: React.FC<AnalyticsEditFormProps> = ({ analytic, isOpen, setIsOpen, onSuccess }) => {
  const { user } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [availableCampaigns, setAvailableCampaigns] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { watch } = form;
  const watchedFields = watch();

  useEffect(() => {
    if (isOpen && user) {
      setIsLoadingCompanies(true);
      fetchCompaniesWithStands(user.id)
        .then(setCompanies)
        .catch(err => showError(`Erro ao carregar empresas: ${err.message}`))
        .finally(() => setIsLoadingCompanies(false));

      setIsLoadingCampaigns(true);
      fetchCampaigns(user.id)
        .then(campaigns => setAvailableCampaigns(campaigns.map(c => ({ value: c.id!, label: c.name }))))
        .catch(err => showError(`Erro ao carregar campanhas: ${err.message}`))
        .finally(() => setIsLoadingCampaigns(false));
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (analytic) {
      form.reset({
        ...analytic,
        company_db_id: analytic.company_db_id || "",
        campaign_id: analytic.campaign_id || 'null-campaign-option',
        start_date: analytic.start_date ? new Date(analytic.start_date) : undefined,
        end_date: analytic.end_date ? new Date(analytic.end_date) : undefined,
        views: analytic.views ?? 0,
        clicks: analytic.clicks ?? 0,
        phone_views: analytic.phone_views ?? 0,
        whatsapp_interactions: analytic.whatsapp_interactions ?? 0,
        leads_email: analytic.leads_email ?? 0,
        location_clicks: analytic.location_clicks ?? 0,
        total_ads: analytic.total_ads ?? 0,
        favorites: analytic.favorites ?? 0,
        total_cost: analytic.total_cost ?? 0,
        revenue: analytic.revenue ?? 0,
      });
    }
  }, [analytic, form, isOpen]);

  const calculatedMetrics = useMemo(() => {
    const { views = 0, clicks = 0, phone_views = 0, whatsapp_interactions = 0, leads_email = 0, location_clicks = 0, total_ads = 0, total_cost = 0, revenue = 0 } = watchedFields;

    const totalLeads = (phone_views || 0) + (whatsapp_interactions || 0) + (leads_email || 0);
    const totalInteractions = (clicks || 0) + (whatsapp_interactions || 0) + (phone_views || 0) + (leads_email || 0) + (location_clicks || 0);

    const cpl = totalLeads > 0 ? total_cost / totalLeads : 0;
    const cpm = views > 0 ? (total_cost / views) * 1000 : 0;
    const cpc = clicks > 0 ? total_cost / clicks : 0;
    const cpa = totalInteractions > 0 ? total_cost / totalInteractions : 0;
    const roi = total_cost > 0 ? ((revenue - total_cost) / total_cost) * 100 : 0;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    const custoPorAnuncio = total_ads > 0 ? total_cost / total_ads : 0;
    const performancePorAnuncio = total_ads > 0 ? totalLeads / total_ads : 0;
    const adEfficiencyScore = total_ads > 0 ? revenue / total_ads : 0;

    return {
      totalLeads,
      cpl,
      cpm,
      cpc,
      cpa,
      roi,
      ctr,
      custoPorAnuncio,
      performancePorAnuncio,
      adEfficiencyScore,
    };
  }, [watchedFields]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !analytic.id) {
      showError("Dados inválidos para atualização.");
      return;
    }
    
    const selectedCompany = companies.find(c => c.id === values.company_db_id);
    if (!selectedCompany) {
      showError("Empresa selecionada inválida.");
      return;
    }

    try {
      await updateAnalytic(analytic.id, {
        ...values,
        company_excel_id: selectedCompany.Company_id,
        campaign_id: values.campaign_id === 'null-campaign-option' ? null : values.campaign_id,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      });
      showSuccess("Análise de campanha atualizada com sucesso!");
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      showError(`Erro ao atualizar análise: ${error.message}`);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatNumber = (value: number) => value.toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Análise de Campanha</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] p-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="company_db_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente (Empresa)</FormLabel>
                      <FormControl>
                        <Combobox
                          options={companies.map(c => ({ value: c.id!, label: c.Commercial_Name || c.Company_Name }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Selecione uma empresa"
                          searchPlaceholder="Pesquisar empresa..."
                          emptyMessage="Nenhuma empresa encontrada."
                          disabled={isLoadingCompanies}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campanha</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'null-campaign-option'} disabled={isLoadingCampaigns}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma campanha" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null-campaign-option">Nenhuma Campanha</SelectItem>
                          {availableCampaigns.map((campaign) => (
                            <SelectItem key={campaign.value} value={campaign.value}>
                              {campaign.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Campanha</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Campanha de Verão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva os detalhes da campanha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <DatePicker date={field.value} setDate={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Fim</FormLabel>
                        <FormControl>
                          <DatePicker date={field.value} setDate={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <h3 className="text-lg font-semibold pt-4">Métricas da Campanha</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="views"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visualizações</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clicks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliques</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_views"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visualizações do Telefone</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp_interactions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interações WhatsApp</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leads_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leads (Email)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location_clicks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliques na Localização</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_ads"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total de Anúncios</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="favorites"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favoritos</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo Total (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="revenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receita (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                <h3 className="text-lg font-semibold">Métricas Calculadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {calculatedMetrics.totalLeads}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">CPL (Custo por Lead)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatCurrency(calculatedMetrics.cpl)}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">CPM (Custo por Mil)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatCurrency(calculatedMetrics.cpm)}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">CPC (Custo por Clique)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatCurrency(calculatedMetrics.cpc)}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">CPA (Custo por Interação)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatCurrency(calculatedMetrics.cpa)}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">ROI (Retorno Investimento)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatPercentage(calculatedMetrics.roi)}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">CTR (Taxa de Cliques)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatPercentage(calculatedMetrics.ctr)}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">Custo por Anúncio</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatCurrency(calculatedMetrics.custoPorAnuncio)}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">Performance por Anúncio</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatNumber(calculatedMetrics.performancePorAnuncio)}
                    </CardContent>
                  </Card>
                  <Card className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ad Efficiency Score</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-2xl font-bold">
                      {formatNumber(calculatedMetrics.adEfficiencyScore)}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsEditForm;