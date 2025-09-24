"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Employee, Stand } from '@/types/crm';
import { updateEmployee, fetchCompaniesByExcelCompanyIds } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeEditFormProps {
  employee: Employee;
  companyStands: Stand[]; // Pass available stands for the select
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  nome_colaborador: z.string().min(1, "Nome do Colaborador é obrigatório"),
  telemovel: z.string().nullable().optional(),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal('')),
  cargo: z.string().nullable().optional(),
  image_url: z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  stand_id: z.string().nullable().optional(),
  stand_name: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  employee,
  companyStands,
  onSave,
  onCancel,
}) => {
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
      nome_colaborador: employee.nome_colaborador || '',
      telemovel: employee.telemovel || '',
      email: employee.email || '',
      cargo: employee.cargo || '',
      image_url: employee.image_url || '',
      stand_id: employee.stand_id || '',
      stand_name: employee.stand_name || '',
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedEmployee: Partial<Omit<Employee, 'id' | 'created_at' | 'user_id' | 'id_people'>> = {
        nome_colaborador: values.nome_colaborador,
        telemovel: values.telemovel || null,
        email: values.email || null,
        cargo: values.cargo || null,
        image_url: values.image_url || null,
        stand_id: values.stand_id || null,
        stand_name: values.stand_name || null,
      };

      await updateEmployee(employee.id!, updatedEmployee);
      showSuccess("Colaborador atualizado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar colaborador:", error);
      showError(error.message || "Falha ao atualizar o colaborador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldsConfig = [
    { name: "nome_colaborador", label: "Nome do Colaborador", type: "text", required: true },
    { name: "telemovel", label: "Telemóvel", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "cargo", label: "Cargo", type: "text" },
    { name: "image_url", label: "URL da Imagem", type: "url" },
    {
      name: "stand_id",
      label: "Stand",
      type: "select",
      options: companyStands.map(stand => ({ value: stand.Stand_ID, label: stand.Stand_ID + ' - ' + (stand.Stand_Name || stand.Company_Name) })),
      placeholder: "Selecione o Stand",
      onValueChange: (value: string) => {
        const selectedStand = companyStands.find(s => s.Stand_ID === value);
        form.setValue("stand_name", selectedStand?.Stand_Name || selectedStand?.Company_Name || '');
        form.setValue("stand_id", value);
      },
      value: form.watch("stand_id") || '',
      disabled: companyStands.length === 0,
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A editar colaborador para a empresa com ID Excel: <span className="font-semibold">{employee.company_excel_id}</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldsConfig.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof FormData}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    {field.type === "select" ? (
                      <Select
                        onValueChange={(value) => {
                          if (field.onValueChange) {
                            field.onValueChange(value);
                          } else {
                            formField.onChange(value);
                          }
                        }}
                        value={field.value}
                        disabled={field.disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {companyStands.length === 0 ? (
                            <SelectItem value="no-options" disabled>Nenhuma opção disponível</SelectItem>
                          ) : (
                            field.options?.map((option: any) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))
                          )}
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

export default EmployeeEditForm;