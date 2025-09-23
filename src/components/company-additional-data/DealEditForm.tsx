"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Negocio, Product } from '@/types/crm'; // Import Product type
import { updateDeal, fetchProducts } from '@/integrations/supabase/utils'; // Import fetchProducts
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

interface DealEditFormProps {
  deal: Negocio;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  commercial_name: z.string().nullable().optional(), // Added for display, not for submission
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
  product_id: z.string().nullable().optional(), // NEW: Product ID
});

type FormData = z.infer<typeof formSchema>;

const DealEditForm: React.FC<DealEditFormProps> = ({ deal, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // State to store products

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

  // Fetch products when userId is available
  useEffect(() => {
    const loadProducts = async () => {
      if (!userId) return;
      try {
        const fetchedProducts = await fetchProducts(userId);
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Erro ao carregar produtos:", err);
        showError(err.message || "Falha ao carregar a lista de produtos.");
      }
    };

    if (userId) {
      loadProducts();
    }
  }, [userId]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commercial_name: deal.commercial_name || '', // Set default from prop
      deal_name: deal.deal_name || '',
      deal_status: deal.deal_status || 'Prospecting',
      deal_value: deal.deal_value || 0,
      currency: deal.currency || 'EUR',
      expected_close_date: deal.expected_close_date ? parseISO(deal.expected_close_date) : undefined,
      stage: deal.stage || '',
      priority: deal.priority || 'Medium',
      notes: deal.notes || '',
      product_id: deal.product_id || '', // NEW: Default product_id
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedDeal: Partial<Omit<Negocio, 'id' | 'created_at' | 'user_id' | 'commercial_name' | 'product_name'>> = {
        deal_name: values.deal_name,
        deal_status: values.deal_status || 'Prospecting',
        deal_value: values.deal_value || 0,
        currency: values.currency || 'EUR',
        expected_close_date: values.expected_close_date ? values.expected_close_date.toISOString() : null,
        stage: values.stage || null,
        priority: values.priority || 'Medium',
        notes: values.notes || null,
        product_id: values.product_id || null, // NEW: Include product_id
      };

      await updateDeal(deal.id!, updatedDeal); // deal.id is guaranteed to exist for an existing deal
      showSuccess("Negócio atualizado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar negócio:", error);
      showError(error.message || "Falha ao atualizar o negócio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "commercial_name", label: "Nome Comercial da Empresa", type: "text", readOnly: true }, // Read-only field
    { name: "deal_name", label: "Nome do Negócio", type: "text", required: true },
    { name: "deal_status", label: "Status", type: "select", options: ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"] },
    { name: "deal_value", label: "Valor do Negócio", type: "number" },
    { name: "currency", label: "Moeda", type: "select", options: ["EUR", "USD", "GBP"] },
    { name: "expected_close_date", label: "Data de Fecho Esperada", type: "date" },
    { name: "stage", label: "Etapa", type: "text" },
    { name: "priority", label: "Prioridade", type: "select", options: ["Low", "Medium", "High"] },
    { name: "product_id", label: "Produto", type: "select", options: products.map(p => ({ value: p.id!, label: p.produto })) }, // NEW: Product Select
    { name: "notes", label: "Notas", type: "textarea", colSpan: 2 },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A editar negócio para a empresa com ID Excel: <span className="font-semibold">{deal.company_excel_id}</span>
        </p>
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
                          <SelectValue placeholder={`Selecione um ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option: any) => ( // Adjusted type for options
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
                        readOnly={field.readOnly} // Apply readOnly prop
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
          <Button type="submit" disabled={isSubmitting || !userId || !form.formState.isValid}>
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

export default DealEditForm;