"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EasyvistaType } from '@/types/crm';
import { updateEasyvistaType } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Check } from 'lucide-react'; // Import Check icon
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'; // Import Command components
import { cn } from '@/lib/utils'; // Import cn utility

interface EasyvistaTypeEditFormProps {
  easyvistaType: EasyvistaType;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome do Tipo é obrigatório"),
  display_fields: z.array(z.string()).optional(), // NEW: Add display_fields to schema
});

type FormData = z.infer<typeof formSchema>;

const optionalEasyvistaFields = [
  { value: "Email Pisca", label: "Email Pisca" },
  { value: "Pass Pisca", label: "Pass Pisca" },
  { value: "Client ID", label: "Client ID" },
  { value: "Client Secret", label: "Client Secret" },
  { value: "Integração", label: "Integração" },
  { value: "NIF da empresa", label: "NIF da Empresa" },
  { value: "Campanha", label: "Campanha" },
  { value: "Duração do acordo", label: "Duração do Acordo" },
  { value: "Plano do acordo", label: "Plano do Acordo" },
  { value: "Valor sem iva", label: "Valor sem IVA" },
  { value: "ID_Proposta", label: "ID Proposta" },
];

const EasyvistaTypeEditForm: React.FC<EasyvistaTypeEditFormProps> = ({ easyvistaType, onSave, onCancel }) => {
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
      name: easyvistaType.name || '',
      display_fields: easyvistaType.display_fields || [], // Initialize with existing fields
    },
  });

  const selectedDisplayFields = form.watch("display_fields");

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedType: Partial<Omit<EasyvistaType, 'id' | 'created_at' | 'user_id'>> = {
        name: values.name,
        display_fields: values.display_fields && values.display_fields.length > 0 ? values.display_fields : null,
      };

      await updateEasyvistaType(easyvistaType.id!, updatedType);
      showSuccess("Tipo de Easyvista atualizado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar tipo de Easyvista:", error);
      showError(error.message || "Falha ao atualizar o tipo de Easyvista.");
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

        {/* NEW: Multi-select for display_fields */}
        <FormField
          control={form.control}
          name="display_fields"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campos Opcionais a Exibir</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedDisplayFields && selectedDisplayFields.length > 0
                      ? `${selectedDisplayFields.length} campos selecionados`
                      : "Selecione os campos a exibir"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Pesquisar campos..." />
                    <CommandList>
                      <CommandEmpty>Nenhum campo encontrado.</CommandEmpty>
                      <CommandGroup>
                        {optionalEasyvistaFields.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              const currentSelection = new Set(field.value);
                              if (currentSelection.has(option.value)) {
                                currentSelection.delete(option.value);
                              } else {
                                currentSelection.add(option.value);
                              }
                              field.onChange(Array.from(currentSelection));
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(option.value) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

export default EasyvistaTypeEditForm;