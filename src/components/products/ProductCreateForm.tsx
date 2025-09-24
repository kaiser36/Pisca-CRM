"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/types/crm';
import { insertProduct } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ProductCreateFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  categoria: z.string().nullable().optional(),
  produto: z.string().min(1, "Nome do Produto é obrigatório"),
  unidade: z.preprocess( // Changed to number
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  preco_unitario: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ),
  preco_total: z.number().nullable().optional(), // preco_total is now derived
});

type FormData = z.infer<typeof formSchema>;

interface FieldBase {
  name: keyof FormData;
  label: string;
  required?: boolean;
  readOnly?: boolean; // Added readOnly prop
}

interface TextField extends FieldBase {
  type: "text" | "number" | "textarea";
}

interface SelectField extends FieldBase {
  type: "select";
  options: string[];
}

type FormFieldConfig = TextField | SelectField;

const ProductCreateForm: React.FC<ProductCreateFormProps> = ({ onSave, onCancel }) => {
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
      categoria: '',
      produto: '',
      unidade: 0, // Default to 0 for number type
      preco_unitario: 0,
      preco_total: 0,
    },
  });

  const { watch, setValue } = form;
  const unidade = watch("unidade");
  const preco_unitario = watch("preco_unitario");

  // Effect to calculate preco_total
  useEffect(() => {
    const calculatedTotal = (unidade || 0) * (preco_unitario || 0);
    setValue("preco_total", calculatedTotal);
  }, [unidade, preco_unitario, setValue]);

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar o produto.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newProduct: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        categoria: values.categoria || null,
        produto: values.produto,
        unidade: values.unidade || null,
        preco_unitario: values.preco_unitario || null,
        preco_total: values.preco_total || null, // Use the calculated value
      };

      await insertProduct(newProduct);
      showSuccess("Produto criado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      showError(error.message || "Falha ao criar o produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FormFieldConfig[] = [
    { name: "categoria", label: "Categoria", type: "select", options: ["Extras", "Planos"] },
    { name: "produto", label: "Produto", type: "text", required: true },
    { name: "unidade", label: "Unidade", type: "number" }, // Changed to number
    { name: "preco_unitario", label: "Preço Unitário", type: "number" },
    { name: "preco_total", label: "Preço Total", type: "number", readOnly: true }, // Made read-only
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof FormData}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    {field.type === "textarea" ? (
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
                A Criar...
              </>
            ) : (
              "Criar Produto"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductCreateForm;