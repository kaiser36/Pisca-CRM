"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Account } from '@/types/crm';
import { insertAccount } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccountCreateFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  account_name: z.string().min(1, "Nome da Conta é obrigatório"),
  am: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal('')),
  photo_url: z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  district: z.string().nullable().optional(),
  credibom_email: z.string().email("Email inválido").nullable().optional().or(z.literal('')),
  role: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AccountCreateForm: React.FC<AccountCreateFormProps> = ({ onSave, onCancel }) => {
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
      account_name: '',
      am: '',
      phone_number: '',
      email: '',
      photo_url: '',
      district: '',
      credibom_email: '',
      role: 'user', // Default role
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar a conta.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newAccount: Omit<Account, 'id' | 'created_at'> = {
        user_id: userId,
        account_name: values.account_name,
        am: values.am || null,
        phone_number: values.phone_number || null,
        email: values.email || null,
        photo_url: values.photo_url || null,
        district: values.district || null,
        credibom_email: values.credibom_email || null,
        role: values.role || 'user',
      };

      await insertAccount(newAccount);
      showSuccess("Conta criada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      showError(error.message || "Falha ao criar a conta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "account_name", label: "Nome da Conta", type: "text", required: true },
    { name: "am", label: "AM", type: "text" },
    { name: "phone_number", label: "Número de Telefone", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "photo_url", label: "URL da Foto", type: "url" },
    { name: "district", label: "Distrito", type: "text" },
    { name: "credibom_email", label: "Email Credibom", type: "email" },
    { name: "role", label: "Função do AM", type: "select", options: ["user", "admin", "editor"] }, // Updated label
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
                    {field.type === "select" ? (
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
                        value={formField.value as string || ''}
                        onChange={formField.onChange}
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
          <Button type="submit" disabled={isSubmitting || !userId}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Criar...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccountCreateForm;