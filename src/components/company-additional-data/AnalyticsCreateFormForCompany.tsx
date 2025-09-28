import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useSession } from '@/context/SessionContext';
import { createAnalytic } from '@/integrations/supabase/services/analyticsService';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
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

interface AnalyticsCreateFormForCompanyProps {
  companyDbId: string;
  companyExcelId: string;
  commercialName: string;
  onSave: () => void;
  onCancel: () => void;
}

const AnalyticsCreateFormForCompany: React.FC<AnalyticsCreateFormForCompanyProps> = ({
  companyDbId,
  companyExcelId,
  commercialName,
  onSave,
  onCancel,
}) => {
  const { user } = useSession();

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      showError("Utilizador não autenticado.");
      return;
    }

    try {
      await createAnalytic({
        ...values,
        user_id: user.id,
        company_db_id: companyDbId,
        company_excel_id: companyExcelId,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        title: values.title,
        description: values.description || undefined,
      });
      showSuccess("Análise de campanha criada com sucesso!");
      form.reset();
      onSave();
    } catch (error: any) {
      showError(`Erro ao criar análise: ${error.message}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] p-4">
          <div className="space-y-4">
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input value={commercialName} disabled />
              </FormControl>
            </FormItem>

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
              {Object.keys(form.getValues()).filter(k => !['title', 'description', 'start_date', 'end_date'].includes(k)).map(key => (
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
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Análise
            </Button>
        </div>
      </form>
    </Form>
  );
};

export default AnalyticsCreateFormForCompany;