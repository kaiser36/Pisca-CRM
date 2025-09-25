"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Campaign } from '@/types/crm';
import { insertCampaign } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

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
import { Switch } from '@/components/ui/switch';

interface CampaignCreateFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome da Campanha é obrigatório"),
  description: z.string().nullable().optional(),
  type: z.enum(['discount', 'offer', 'other']).default('discount'),
  discount_type: z.enum(['percentage', 'amount', 'none']).default('none'),
  discount_value: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "O valor do desconto não pode ser negativo").nullable().optional()
  ),
  start_date: z.date().nullable().optional(),
  end_date: z.date().nullable().optional(),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

const CampaignCreateForm: React.FC<CampaignCreateFormProps> = ({ onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
      name: '',
      description: '',
      type: 'discount',
      discount_type: 'none',
      discount_value: 0,
      start_date: undefined,
      end_date: undefined,
      is_active: true,
    },
  });

  const { watch, setValue } = form;
  const campaignType = watch("type");
  const discountType = watch("discount_type");

  useEffect(() => {
    if (campaignType !== 'discount') {
      setValue("discount_type", 'none');
      setValue("discount_value", 0);
    }
  }, [campaignType, setValue]);

  useEffect(() => {
    if (discountType === 'none') {
      setValue("discount_value", 0);
    }
  }, [discountType, setValue]);

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar a campanha.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newCampaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        name: values.name,
        description: values.description || null,
        type: values.type,
        discount_type: values.type === 'discount' ? values.discount_type : 'none',
        discount_value: values.type === 'discount' ? values.discount_value : null,
        start_date: values.start_date ? values.start_date.toISOString() : null,
        end_date: values.end_date ? values.end_date.toISOString() : null,
        is_active: values.is_active,
      };

      await insertCampaign(newCampaign);
      showSuccess("Campanha criada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar campanha:", error);
      showError(error.message || "Falha ao criar a campanha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "name", label: "Nome da Campanha", type: "text", required: true },
    { name: "type", label: "Tipo de Campanha", type: "select", options: [{ value: 'discount', label: 'Desconto' }, { value: 'offer', label: 'Oferta' }, { value: 'other', label: 'Outro' }] },
    { name: "description", label: "Descrição", type: "textarea", colSpan: 2 },
    { name: "start_date", label: "Data de Início", type: "date" },
    { name: "end_date", label: "Data de Fim", type: "date" },
    { name: "is_active", label: "Ativa", type: "boolean" },
    { name: "discount_type", label: "Tipo de Desconto", type: "select", options: [{ value: 'none', label: 'Nenhum' }, { value: 'percentage', label: 'Percentagem' }, { value: 'amount', label: 'Valor Fixo' }], conditional: (val: FormData) => val.type === 'discount' },
    { name: "discount_value", label: "Valor do Desconto", type: "number", conditional: (val: FormData) => val.type === 'discount' && val.discount_type !== 'none' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            if (field.conditional && !field.conditional(form.getValues())) {
              return null;
            }
            return (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as keyof FormData}
                render={({ field: formField }) => (
                  <FormItem className={field.colSpan === 2 ? "md:col-span-2" : ""}>
                    <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                    <FormControl>
                      {field.type === "boolean" ? (
                        <Switch
                          checked={formField.value as boolean}
                          onCheckedChange={formField.onChange}
                        />
                      ) : field.type === "date" ? (
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
                        <Select onValueChange={formField.onChange} value={formField.value as string}>
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
          <Button type="submit" disabled={isSubmitting || !userId || !form.formState.isValid}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Criar...
              </>
            ) : (
              "Criar Campanha"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CampaignCreateForm;