"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AccountContact } from '@/types/crm';
import { insertAccountContact } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { getContactTypes, ContactType } from '@/integrations/supabase/services/contactTypeService';
import { getContactReportOptionsByContactTypeId, ContactReportOption } from '@/integrations/supabase/services/contactReportOptionService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';

interface AccountContactCreateFormProps {
  companyExcelId: string;
  onSave: () => void;
  onCancel: () => void;
  commercialName?: string | null;
  companyName?: string | null;
}

const formSchema = z.object({
  account_am: z.string().nullable().optional(),
  contact_type: z.string().min(1, "Tipo de Contacto é obrigatório").nullable().optional(),
  report_text: z.string().nullable().optional(), // Agora será uma seleção
  contact_date: z.date().nullable().optional(),
  contact_method: z.string().min(1, "Meio de Contacto é obrigatório").nullable().optional(),
  commercial_name: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  crm_id: z.string().nullable().optional(),
  stand_name: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  contact_person_name: z.string().nullable().optional(),
  company_group: z.string().nullable().optional(),
  account_armatis: z.string().nullable().optional(),
  quarter: z.string().nullable().optional(),
  is_credibom_partner: z.boolean().optional(),
  send_email: z.boolean().optional(),
  email_type: z.string().nullable().optional(),
  email_subject: z.string().nullable().optional(),
  email_body: z.string().nullable().optional(),
  attachment_url: z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  sending_email: z.string().email("Email inválido").nullable().optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

const AccountContactCreateForm: React.FC<AccountContactCreateFormProps> = ({
  companyExcelId,
  onSave,
  onCancel,
  commercialName,
  companyName,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyDbId, setCompanyDbId] = useState<string | null>(null);
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [reportOptions, setReportOptions] = useState<{ value: string; label: string }[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_am: '',
      contact_type: '',
      report_text: '',
      contact_date: new Date(),
      contact_method: '',
      commercial_name: commercialName || '',
      company_name: companyName || '',
      crm_id: '',
      stand_name: '',
      subject: '',
      contact_person_name: '',
      company_group: '',
      account_armatis: '',
      quarter: '',
      is_credibom_partner: false,
      send_email: false,
      email_type: '',
      email_subject: '',
      email_body: '',
      attachment_url: '',
      sending_email: '',
    },
  });

  const selectedContactTypeName = form.watch('contact_type');

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

  // Buscar tipos de contacto
  useEffect(() => {
    const fetchContactTypes = async () => {
      try {
        const types = await getContactTypes();
        setContactTypes(types);
      } catch (error) {
        console.error('Erro ao buscar tipos de contacto:', error);
        showError('Erro ao carregar tipos de contacto');
      }
    };

    fetchContactTypes();
  }, []);

  // Fetch company_db_id based on companyExcelId and userId
  useEffect(() => {
    const fetchCompanyDbId = async () => {
      if (userId && companyExcelId) {
        const { data, error } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', userId)
          .eq('company_id', companyExcelId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching company_db_id:', error);
          showError(`Falha ao obter o ID interno da empresa: ${error.message}`);
          setCompanyDbId(null);
        } else if (data) {
          setCompanyDbId(data.id);
        } else {
          showError(`Empresa com ID Excel '${companyExcelId}' não encontrada no CRM principal.`);
          setCompanyDbId(null);
        }
      }
    };

    fetchCompanyDbId();
  }, [userId, companyExcelId]);

  // Fetch report options based on selected contact type
  useEffect(() => {
    console.log("useEffect: selectedContactTypeName changed to:", selectedContactTypeName);
    console.log("useEffect: contactTypes available:", contactTypes);
    
    const fetchReportOptions = async () => {
      if (selectedContactTypeName) {
        console.log("useEffect: Searching for contact type with name:", selectedContactTypeName);
        const contactType = contactTypes.find(type => type.name === selectedContactTypeName);
        console.log("useEffect: Found contact type:", contactType);
        
        if (contactType?.id) {
          try {
            console.log("useEffect: Fetching report options for contact type ID:", contactType.id);
            const options = await getContactReportOptionsByContactTypeId(contactType.id);
            console.log("useEffect: Fetched report options:", options);
            setReportOptions(options.map(opt => ({ value: opt.report_text, label: opt.report_text })));
          } catch (error) {
            console.error('Erro ao buscar opções de relatório:', error);
            showError('Erro ao carregar opções de relatório');
            setReportOptions([]);
          }
        } else {
          console.log("useEffect: No contact type found, clearing report options");
          setReportOptions([]);
        }
      } else {
        console.log("useEffect: No contact type selected, clearing report options");
        setReportOptions([]);
      }
      form.setValue('report_text', ''); // Reset report_text when contact_type changes
    };

    fetchReportOptions();
  }, [selectedContactTypeName, contactTypes, form]);


  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar o contacto.");
      return;
    }
    if (!companyDbId) {
      showError("Não foi possível associar o contacto a uma empresa válida. Por favor, verifique o ID Excel da empresa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newContact: Omit<AccountContact, 'id' | 'created_at'> = {
        user_id: userId,
        company_db_id: companyDbId,
        company_excel_id: companyExcelId,
        account_am: values.account_am || null,
        contact_type: values.contact_type || null,
        report_text: values.report_text || null,
        contact_date: values.contact_date ? values.contact_date.toISOString() : null,
        contact_method: values.contact_method || null,
        commercial_name: values.commercial_name || null,
        company_name: values.company_name || null,
        crm_id: values.crm_id || null,
        stand_name: values.stand_name || null,
        subject: values.subject || null,
        contact_person_name: values.contact_person_name || null,
        company_group: values.company_group || null,
        account_armatis: values.account_armatis || null,
        quarter: values.quarter || null,
        is_credibom_partner: values.is_credibom_partner || false,
        send_email: values.send_email || false,
        email_type: values.email_type || null,
        email_subject: values.email_subject || null,
        email_body: values.email_body || null,
        attachment_url: values.attachment_url || null,
        sending_email: values.sending_email || null,
      };

      await insertAccountContact(newContact);
      showSuccess("Contacto de conta criado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar contacto de conta:", error);
      showError(error.message || "Falha ao criar o contacto de conta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obter nomes únicos de tipos de contacto
  const uniqueContactTypeNames = Array.from(
    new Set(contactTypes.map(type => type.name))
  ).map(name => ({
    value: name,
    label: name
  }));

  const fields = [
    { name: "account_am", label: "AM da Conta", type: "text" },
    { 
      name: "contact_type", 
      label: "Tipo de Contacto", 
      type: "combobox", 
      options: uniqueContactTypeNames 
    },
    { name: "contact_date", label: "Data do Contacto", type: "date" },
    { name: "contact_method", label: "Meio de Contacto", type: "select", options: ["Telefone", "Email", "Presencial", "Videoconferência", "Outro"] },
    { name: "commercial_name", label: "Nome Comercial", type: "text" },
    { name: "company_name", label: "Nome da Empresa", type: "text" },
    { name: "crm_id", label: "ID CRM", type: "text" },
    { name: "stand_name", label: "Nome do Stand", type: "text" },
    { name: "subject", label: "Assunto", type: "text" },
    { name: "contact_person_name", label: "Pessoa de Contacto", type: "text" },
    { name: "company_group", label: "Grupo da Empresa", type: "text" },
    { name: "account_armatis", label: "Account Armatis", type: "text" },
    { name: "quarter", label: "Trimestre", type: "text" },
    { name: "is_credibom_partner", label: "É Parceiro Credibom?", type: "boolean" },
    { name: "send_email", label: "Enviar Email?", type: "boolean" },
    { name: "email_type", label: "Tipo de Email", type: "text" },
    { name: "email_subject", label: "Assunto do Email", type: "text" },
    { name: "attachment_url", label: "URL do Anexo", type: "url" },
    { name: "sending_email", label: "Email de Envio", type: "email" },
    { 
      name: "report_text", 
      label: "Report", 
      type: "combobox", 
      colSpan: 2, 
      options: reportOptions,
      disabled: reportOptions.length === 0 // Disable if no options
    },
    { name: "email_body", label: "Corpo do Email", type: "textarea", colSpan: 2 },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A criar contacto para a empresa com ID Excel: <span className="font-semibold">{companyExcelId}</span>
        </p>
        {!companyDbId && (
          <p className="text-sm text-red-500">
            Não foi possível encontrar a empresa no CRM principal com o ID Excel fornecido. O contacto não poderá ser criado.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof FormData}
              render={({ field: formField }) => {
                console.log(`FormField: ${field.name}, Value:`, formField.value);
                if (field.name === "report_text") {
                  console.log("Report Combobox options:", field.options);
                  console.log("Report Combobox disabled:", field.disabled);
                }
                return (
                <FormItem className={field.colSpan === 2 ? "md:col-span-2" : ""}>
                  <FormLabel>{field.label}</FormLabel>
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
                    ) : field.type === "combobox" ? (
                      <Combobox
                        options={field.options as { value: string; label: string }[] || []}
                        value={formField.value as string}
                        onChange={formField.onChange}
                        placeholder={field.name === "contact_type" ? "Selecione um tipo de contacto" : "Selecione uma opção de relatório"}
                        searchPlaceholder={field.name === "contact_type" ? "Pesquisar tipos de contacto..." : "Pesquisar opções de relatório..."}
                        emptyMessage={field.name === "contact_type" ? "Nenhum tipo de contacto encontrado." : "Nenhuma opção de relatório encontrada."}
                        disabled={field.disabled}
                      />
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
              );
            }}
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !userId || !companyDbId}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Criar...
              </>
            ) : (
              "Criar Contacto"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccountContactCreateForm;