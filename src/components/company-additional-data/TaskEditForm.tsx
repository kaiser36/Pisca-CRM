"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, Employee, Account, Company } from '@/types/crm'; // Import Company and Account
import { updateTask, fetchEmployeesByCompanyExcelId, fetchAccounts, fetchCompaniesByExcelCompanyIds } from '@/integrations/supabase/utils'; // Import fetchAccounts and fetchCompaniesByExcelCompanyIds
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

interface TaskEditFormProps {
  task: Task;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().nullable().optional(),
  due_date: z.date().nullable().optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).default('Pending'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  assigned_to_employee_id: z.string().nullable().optional(), // Now refers to AM ID
  assigned_to_employee_name: z.string().nullable().optional(), // Now refers to AM Name
});

type FormData = z.infer<typeof formSchema>;

const TaskEditForm: React.FC<TaskEditFormProps> = ({ task, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null); // State for company details
  const [availableAMs, setAvailableAMs] = useState<Account[]>([]); // State for available AMs
  const [isAMsLoading, setIsAMsLoading] = useState(true); // Loading state for AMs

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

  useEffect(() => {
    const loadData = async () => {
      if (!userId || !task.company_excel_id) return;
      setIsAMsLoading(true);
      try {
        // Fetch company details
        const companies = await fetchCompaniesByExcelCompanyIds(userId, [task.company_excel_id]);
        const currentCompany = companies.find(c => c.Company_id === task.company_excel_id);
        setCompanyDetails(currentCompany || null);

        // Fetch all AMs
        const fetchedAMs = await fetchAccounts(userId);
        setAvailableAMs(fetchedAMs);

        // Set default AM if task has one, otherwise try company's AM
        if (task.assigned_to_employee_id) {
          const defaultAM = fetchedAMs.find(am => am.id === task.assigned_to_employee_id);
          if (defaultAM) {
            form.setValue("assigned_to_employee_name", defaultAM.account_name || defaultAM.am || null);
          }
        } else if (currentCompany?.AM_Current) {
          const defaultAM = fetchedAMs.find(am => am.am === currentCompany.AM_Current);
          if (defaultAM) {
            form.setValue("assigned_to_employee_id", defaultAM.id);
            form.setValue("assigned_to_employee_name", defaultAM.account_name || defaultAM.am || null);
          }
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados para o formulário de tarefa:", err);
        showError(err.message || "Falha ao carregar dados necessários.");
      } finally {
        setIsAMsLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId, task.company_excel_id, task.assigned_to_employee_id]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date ? parseISO(task.due_date) : undefined,
      status: task.status || 'Pending',
      priority: task.priority || 'Medium',
      assigned_to_employee_id: task.assigned_to_employee_id || '',
      assigned_to_employee_name: task.assigned_to_employee_name || '',
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedTask: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'company_excel_id'>> = {
        title: values.title,
        description: values.description || null,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        status: values.status,
        priority: values.priority,
        assigned_to_employee_id: values.assigned_to_employee_id || null,
        assigned_to_employee_name: values.assigned_to_employee_name || null,
      };

      await updateTask(task.id!, updatedTask);
      showSuccess("Tarefa atualizada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar tarefa:", error);
      showError(error.message || "Falha ao atualizar a tarefa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "description", label: "Descrição", type: "textarea", colSpan: 2 },
    { name: "due_date", label: "Data Limite", type: "date" },
    { name: "status", label: "Status", type: "select", options: ['Pending', 'In Progress', 'Completed', 'Cancelled'] },
    { name: "priority", label: "Prioridade", type: "select", options: ['Low', 'Medium', 'High'] },
    {
      name: "assigned_to_employee_id",
      label: "Atribuído a (AM)", // Changed label
      type: "select",
      options: availableAMs.map(am => ({ value: am.id, label: am.account_name || am.am || 'N/A' })), // Map AMs
      placeholder: "Selecione um AM",
      onValueChange: (value: string) => {
        const selectedAM = availableAMs.find(am => am.id === value);
        form.setValue("assigned_to_employee_name", selectedAM?.account_name || selectedAM?.am || null);
        form.setValue("assigned_to_employee_id", value);
      },
      value: form.watch("assigned_to_employee_id") || '',
      disabled: isAMsLoading || availableAMs.length === 0,
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A editar tarefa para a empresa <span className="font-semibold">{companyDetails?.Commercial_Name || (companyDetails?.Company_Name ? `${companyDetails.Company_Name} (Nome Fiscal)` : task.company_excel_id)}</span> (ID Excel: <span className="font-semibold">{task.company_excel_id}</span>)
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
                          {field.options?.length === 0 ? (
                            <SelectItem value="no-options" disabled>Nenhuma opção disponível</SelectItem>
                          ) : (
                            field.options?.map((option: any) => (
                              <SelectItem key={option.value || option} value={option.value || option}>{option.label || option}</SelectItem>
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

export default TaskEditForm;