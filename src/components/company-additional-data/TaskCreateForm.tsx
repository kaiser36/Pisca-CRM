"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, Account, Company, CompanyAdditionalExcelData } from '@/types/crm'; // Import CompanyAdditionalExcelData
import { insertTask, fetchEmployeesByCompanyExcelId, fetchAccounts, fetchCompaniesByExcelCompanyIds, fetchCompanyAdditionalExcelData } from '@/integrations/supabase/utils'; // Import fetchCompanyAdditionalExcelData
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

interface TaskCreateFormProps {
  companyExcelId: string;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().nullable().optional(),
  due_date: z.date().nullable().optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).default('Pending'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  assigned_to_employee_id: z.string().nullable().optional(),
  assigned_to_employee_name: z.string().nullable().optional(),
  commercial_name: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const TaskCreateForm: React.FC<TaskCreateFormProps> = ({ companyExcelId, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [additionalCompanyDetails, setAdditionalCompanyDetails] = useState<CompanyAdditionalExcelData | null>(null); // NEW: State for additional company data
  const [availableAMs, setAvailableAMs] = useState<Account[]>([]);
  const [isAMsLoading, setIsAMsLoading] = useState(true);
  const [companyDbId, setCompanyDbId] = useState<string | null>(null); // NEW: State for company_db_id

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
      title: '',
      description: '',
      due_date: undefined,
      status: 'Pending',
      priority: 'Medium',
      assigned_to_employee_id: '',
      assigned_to_employee_name: '',
      commercial_name: '',
    },
  });

  const { setValue, watch } = form;
  const assignedToEmployeeId = watch("assigned_to_employee_id");

  useEffect(() => {
    const loadData = async () => {
      if (!userId || !companyExcelId) return;
      setIsAMsLoading(true);
      try {
        // Fetch CRM company data
        const companies = await fetchCompaniesByExcelCompanyIds(userId, [companyExcelId]);
        const currentCompany = companies.find(c => c.Company_id === companyExcelId);
        setCompanyDetails(currentCompany || null);
        setCompanyDbId(currentCompany?.id || null); // NEW: Set company_db_id

        // Fetch additional company data
        const { data: additionalData } = await fetchCompanyAdditionalExcelData(userId, 1, 1, companyExcelId);
        const currentAdditionalData = additionalData.find(c => c.excel_company_id === companyExcelId);
        setAdditionalCompanyDetails(currentAdditionalData || null);
        
        // Determine commercial_name using a more robust logic
        const resolvedCommercialName = currentAdditionalData?.["Nome Comercial"] || currentCompany?.Commercial_Name || currentCompany?.Company_Name || null;
        setValue("commercial_name", resolvedCommercialName);

        const fetchedAMs = await fetchAccounts(userId);
        setAvailableAMs(fetchedAMs);

        if (currentCompany?.AM_Current) {
          const defaultAM = fetchedAMs.find(am => am.am === currentCompany.AM_Current);
          if (defaultAM) {
            setValue("assigned_to_employee_id", defaultAM.id);
            setValue("assigned_to_employee_name", defaultAM.account_name || defaultAM.am || null);
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
  }, [userId, companyExcelId, setValue]);

  // Effect to sync assigned_to_employee_name when assigned_to_employee_id changes
  useEffect(() => {
    if (assignedToEmployeeId && availableAMs.length > 0) {
      const selectedAM = availableAMs.find(am => am.id === assignedToEmployeeId);
      setValue("assigned_to_employee_name", selectedAM?.account_name || selectedAM?.am || null);
    } else if (!assignedToEmployeeId) {
      setValue("assigned_to_employee_name", null);
    }
  }, [assignedToEmployeeId, availableAMs, setValue]);

  // Memoized value for displaying the selected AM's name
  const selectedAMDisplayName = useMemo(() => {
    if (assignedToEmployeeId && availableAMs.length > 0) {
      const selectedAM = availableAMs.find(am => am.id === assignedToEmployeeId);
      return selectedAM?.account_name || selectedAM?.am || null;
    }
    return null;
  }, [assignedToEmployeeId, availableAMs]);

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar a tarefa.");
      return;
    }
    if (!companyDbId) { // NEW: Check if companyDbId is available
      showError("Não foi possível associar a tarefa a uma empresa válida. Por favor, verifique o ID Excel da empresa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        company_excel_id: companyExcelId,
        company_db_id: companyDbId, // NEW: Include company_db_id
        commercial_name: values.commercial_name || null,
        title: values.title,
        description: values.description || null,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        status: values.status,
        priority: values.priority,
        assigned_to_employee_id: values.assigned_to_employee_id || null,
        assigned_to_employee_name: values.assigned_to_employee_name || null,
      };

      await insertTask(newTask);
      showSuccess("Tarefa criada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar tarefa:", error);
      showError(error.message || "Falha ao criar a tarefa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "commercial_name", label: "Nome Comercial da Empresa", type: "text", readOnly: true },
    { name: "title", label: "Título", type: "text", required: true },
    { name: "description", label: "Descrição", type: "textarea", colSpan: 2 },
    { name: "due_date", label: "Data Limite", type: "date" },
    { name: "status", label: "Status", type: "select", options: ['Pending', 'In Progress', 'Completed', 'Cancelled'], placeholder: "Selecione o Status" },
    { name: "priority", label: "Prioridade", type: "select", options: ['Low', 'Medium', 'High'], placeholder: "Selecione a Prioridade" },
    {
      name: "assigned_to_employee_id",
      label: "Atribuído a (AM)",
      type: "select",
      options: availableAMs.map(am => ({ value: am.id, label: am.account_name || am.am || 'N/A' })),
      placeholder: "Selecione um AM",
      disabled: isAMsLoading || availableAMs.length === 0,
    },
  ];

  const companyDisplayName = additionalCompanyDetails?.["Nome Comercial"] && additionalCompanyDetails["Nome Comercial"].trim() !== ''
    ? additionalCompanyDetails["Nome Comercial"]
    : (companyDetails?.Commercial_Name && companyDetails.Commercial_Name.trim() !== ''
      ? companyDetails.Commercial_Name
      : (companyDetails?.Company_Name ? `${companyDetails.Company_Name} (Nome Fiscal)` : companyExcelId));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A criar tarefa para a empresa <span className="font-semibold">{companyDisplayName}</span> (ID Excel: <span className="font-semibold">{companyExcelId}</span>)
        </p>
        {!companyDbId && ( // NEW: Alert if companyDbId is missing
          <p className="text-sm text-red-500">
            Não foi possível encontrar a empresa no CRM principal com o ID Excel fornecido. A tarefa não poderá ser criada.
          </p>
        )}
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
                        onValueChange={formField.onChange}
                        value={String(formField.value || '')}
                        disabled={field.disabled}
                      >
                        <SelectTrigger>
                          {field.name === "assigned_to_employee_id" ? (
                            <SelectValue>
                              {selectedAMDisplayName || field.placeholder}
                            </SelectValue>
                          ) : (
                            <SelectValue placeholder={field.placeholder} />
                          )}
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
                        readOnly={field.readOnly}
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
          <Button type="submit" disabled={isSubmitting || !userId || !companyDbId || !form.formState.isValid}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Criar...
              </>
            ) : (
              "Criar Tarefa"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskCreateForm;