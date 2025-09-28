"use client";

import React, { useState, useEffect } from 'react';
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
import { updateAnalytic } from '@/integrations/supabase/services/analyticsService';
import { Analytics as AnalyticsType, Company } from '@/types/crm';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { fetchCompaniesWithStands } from '@/integrations/supabase/services/companyService';
import { Combobox } from '../ui/combobox';

const formSchema = z.object({
  company_db_id: z.string().min(1, "Selecione uma empresa"),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen && user) {
      setIsLoadingCompanies(true);
      fetchCompaniesWithStands(user.id)
        .then(setCompanies)
        .catch(err => showError(`Erro ao carregar empresas: ${err.message}`))
        .finally(() => setIsLoadingCompanies(false));
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (analytic) {
      form.reset({
        ...analytic,
        company_db_id: analytic.company_db_id || "",
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
                  {Object.keys(form.getValues()).filter(k => !['company_db_id', 'title', 'description', 'start_date', 'end_date'].includes(k)).map(key => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={key as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{key.replace(/_/g, ' ')}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
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