"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useSession } from '@/context/SessionContext';
import { fetchCompaniesWithStands } from '@/integrations/supabase/services/companyService';
import { createAnalytic } from '@/integrations/supabase/services/analyticsService';
import { Company } from '@/types/crm';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

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

interface AnalyticsCreateFormProps {
  onSuccess: () => void;
}

const AnalyticsCreateForm: React.FC<AnalyticsCreateFormProps> = ({ onSuccess }) => {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
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
    },
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      showError("Utilizador não autenticado.");
      return;
    }

    const selectedCompany = companies.find(c => c.id === values.company_db_id);
    if (!selectedCompany) {
      showError("Empresa selecionada inválida.");
      return;
    }

    try {
      await createAnalytic({
        ...values,
        user_id: user.id,
        company_excel_id: selectedCompany.Company_id,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        title: values.title, // Ensure title is explicitly passed
        description: values.description || undefined,
      });
      showSuccess("Análise de campanha criada com sucesso!");
      form.reset();
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      showError(`Erro ao criar análise: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Nova Análise</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Análise de Campanha</DialogTitle>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            {isLoadingCompanies ? <Loader2 className="animate-spin" /> : <SelectValue placeholder="Selecione uma empresa" />}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map(company => (
                            <SelectItem key={company.id} value={company.id!}>
                              {company.Commercial_Name || company.Company_Name}
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
                  {Object.keys(form.getValues()).filter(k => !['company_db_id', 'title', 'description', 'start_date', 'end_date'].includes(k)).map(key => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={key as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{key.replace(/_/g, ' ')}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
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
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Análise
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsCreateForm;