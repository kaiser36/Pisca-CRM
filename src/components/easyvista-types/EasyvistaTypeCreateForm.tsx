"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EasyvistaType } from '@/types/crm';
import { insertEasyvistaType } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

interface EasyvistaTypeCreateFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome do Tipo é obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

const EasyvistaTypeCreateForm: React.FC<EasyvistaTypeCreateFormProps> = ({ onSave, onCancel }) => {
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
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar o tipo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newType: Omit<EasyvistaType, 'id' | 'created_at'> = {
        user_id: userId,
        name: values.name,
      };

      await insertEasyvistaType(newType);
      showSuccess("Tipo de Easyvista criado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar tipo de Easyvista:", error);
      showError(error.message || "Falha ao criar o tipo de Easyvista.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Tipo <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              "Criar Tipo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EasyvistaTypeCreateForm;