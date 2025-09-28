"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AccountContact } from '@/types/crm';
import { updateAccountContact } from '@/integrations/supabase/services/accountContactService';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface AccountContactEditFormProps {
  accountContact: AccountContact;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  account_am: z.string().nullable().optional(),
  contact_type: z.string().min(1, "Tipo de Contacto é obrigatório").nullable().optional(),
  report_text: z.string().nullable().optional(),
  contact_date: z.date().nullable().optional(),
  contact_method: z.string().min(1, "Meio de Contacto é obrigatório").nullable().optional(),
  commercial_name: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  crm_id: z.string().nullable().optional(),
  stand_name: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  contact_person_name: z.string().min(1, "Pessoa de Contacto é obrigatória").nullable().optional(),
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

interface FormFieldConfig {
  name: keyof FormData;
  label: string;
  type: "text" | "number" | "textarea" | "email" | "url" | "boolean" | "select" | "date";
  required?: boolean;
  colSpan?: number;
  options?: (string | { value: string; label: string })[];
  placeholder?: string;
  group: "contact_info" | "company_details" | "email_details";
  conditional?: (values: FormData) => boolean;
}

const AccountContactEditForm: React.FC<AccountContactEditFormProps> = ({
  accountContact,
  onSave,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyDbId, setCompanyDbId] = useState<string | null>(null);

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
    const fetchCompanyDbId = async () => {
      if (userId && accountContact.company_excel_id) {
        const { data, error } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', userId)
          .eq('company_id', accountContact.company_excel_id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching company_db_id:', error);
          showError(`Falha ao obter o ID interno da empresa: ${error.message}`);
          setCompanyDbId(null);
        } else if (data) {
          setCompanyDbId(data.id);
        } else {
          showError(`Empresa com ID Excel '${accountContact.company_excel_id}' não encontrada no CRM principal.`);
          setCompanyDbId(null);
        }
      }
    };

    fetchCompanyDbId();
  }, [userId, accountContact.company_excel_id]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_am: accountContact.account_am || '',
      contact_type: accountContact.contact_type || null,
      report_text: accountContact.report_text || '',
      contact_date: accountContact.contact_date ? parseISO(accountContact.contact_date) : undefined,
      contact_method: accountContact.contact_method || null,
      commercial_name: accountContact.commercial_name || '',
      company_name: accountContact.company_name || '',
      crm_id: accountContact.crm_id || '',
      stand_name: accountContact.stand_name || '',
      subject: accountContact.subject || '',
      contact_person_name: accountContact.contact_person_name || '',
      company_group: accountContact.company_group || '',
      account_armatis: accountContact.account_armatis || '',
      quarter: accountContact.quarter || '',
      is_credibom_partner: accountContact.is_credibom_partner || false,
      send_email: accountContact.send_email || false,
      email_type: accountContact.email_type || null,
      email_subject: accountContact.email_subject || '',
      email_body: accountContact.email_body || '',
      attachment_url: accountContact.attachment_url || '',
      sending_email: accountContact.sending_email || null,
    },
  });

  const sendEmail = form.watch("send_email");

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }
    if (!companyDbId) {
      showError("Não foi possível associar o contacto a uma empresa válida. Por favor, verifique o ID Excel da empresa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedContact: Partial<Omit<AccountContact, 'id' | 'created_at' | 'user_id'>> = {
        company_db_id: companyDbId,
        company_excel_id: accountContact.company_excel_id,
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
        email_type: values.send_email ? (values.email_type || null) : null,
        email_subject: values.send_email ? (values.email_subject || null) : null,
        email_body: values.send_email ? (values.email_body || null) : null,
        attachment_url: values.send_email ? (values.attachment_url || null) : null,
        sending_email: values.send_email ? (values.sending_email || null) : null,
      };

      await updateAccountContact(accountContact.id!, updatedContact);
      showSuccess("Contacto de conta atualizado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar contacto de conta:", error);
      showError(error.message || "Falha ao atualizar o contacto de conta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FormFieldConfig[] = [
    // Contact Information
    { name: "contact_person_name", label: "Pessoa de Contacto", type: "text", required: true, placeholder: "Nome da pessoa contactada", group: "contact_info" },
    { name: "contact_type", label: "Tipo de Contacto", type: "select", options: ["Chamada", "Email", "Reunião", "Visita", "Outro"], placeholder: "Selecione o tipo", group: "contact_info" },
    { name: "contact_method", label: "Meio de Contacto", type: "select", options: ["Telefone", "Email", "Presencial", "Videoconferência", "Outro"], placeholder: "Selecione o meio", group: "contact_info" },
    { name: "contact_date", label: "Data do Contacto", type: "date", group: "contact_info" },
    { name: "subject", label: "Assunto", type: "text", placeholder: "Breve descrição do contacto", group: "contact_info", colSpan: 2 },
    { name: "report_text", label: "Texto do Relatório", type: "textarea", placeholder: "Detalhes do contacto e resultados", group: "contact_info", colSpan: 2 },

    // Company Details
    { name: "commercial_name", label: "Nome Comercial", type: "text", placeholder: "Nome comercial da empresa", group: "company_details" },
    { name: "company_name", label: "Nome da Empresa (Fiscal)", type: "text", placeholder: "Nome fiscal da empresa", group: "company_details" },
    { name: "stand_name", label: "Nome do Stand", type: "text", placeholder: "Nome do stand associado", group: "company_details" },
    { name: "company_group", label: "Grupo da Empresa", type: "text", placeholder: "Grupo a que a empresa pertence", group: "company_details" },
    { name: "crm_id", label: "ID CRM", type: "text", placeholder: "ID da empresa no CRM", group: "company_details" },
    { name: "account_am", label: "AM da Conta", type: "text", placeholder: "Account Manager responsável", group: "company_details" },
    { name: "account_armatis", label: "Account Armatis", type: "text", placeholder: "Account Armatis associado", group: "company_details" },
    { name: "quarter", label: "Trimestre", type: "text", placeholder: "Trimestre do contacto (ex: Q1, Q2)", group: "company_details" },
    { name: "is_credibom_partner", label: "É Parceiro Credibom?", type: "boolean", group: "company_details" },

    // Email Details (Conditional)
    { name: "send_email", label: "Enviar Email?", type: "boolean", group: "email_details", colSpan: 2 },
    { name: "email_type", label: "Tipo de Email", type: "text", placeholder: "Tipo de email (ex: Boas-vindas, Proposta)", group: "email_details", conditional: (values) => values.send_email === true },
    { name: "email_subject", label: "Assunto do Email", type: "text", placeholder: "Assunto do email a ser enviado", group: "email_details", conditional: (values) => values.send_email === true },
    { name: "sending_email", label: "Email de Envio", type: "email", placeholder: "Endereço de email do remetente", group: "email_details", conditional: (values) => values.send_email === true },
    { name: "attachment_url", label: "URL do Anexo", type: "url", placeholder: "Link para o anexo do email", group: "email_details", conditional: (values) => values.send_email === true },
    { name: "email_body", label: "Corpo do Email", type: "textarea", placeholder: "Conteúdo do email", group: "email_details", colSpan: 2, conditional: (values) => values.send_email === true },
  ];

  const renderField = (field: FormFieldConfig) => (
    <FormField
      key={field.name}
      control={form.control}
      name={field.name}
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
                    {formField.value ? format(formField.value as Date, "PPP") : <span>{field.placeholder || "Selecione uma data"}</span>}
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
                placeholder={field.placeholder}
              />
            ) : field.type === "select" ? (
              <Select
                onValueChange={(value) => formField.onChange(value === '---NULL---' ? null : value)}
                value={(formField.value as string | null) || '---NULL---'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || `Selecione um ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='---NULL---'>Nenhum</SelectItem>
                  {field.options?.map((option: any) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    if (optionValue === '') return null; 
                    return <SelectItem key={optionValue} value={optionValue}>{optionLabel}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={field.type}
                {...formField}
                value={formField.value as string | number || ''}
                onChange={formField.onChange}
                placeholder={field.placeholder}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <p className="text-sm text-muted-foreground">
          A editar contacto para a empresa com ID Excel: <span className="font-semibold">{accountContact.company_excel_id}</span>
        </p>
        {!companyDbId && (
          <p className="text-sm text-red-500">
            Não foi possível encontrar a empresa no CRM principal com o ID Excel fornecido. O contacto não poderá ser atualizado.
          </p>
        )}

        {/* Section: Informações do Contacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações do Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.filter(f => f.group === "contact_info").map(renderField)}
          </div>
        </div>

        <Separator />

        {/* Section: Detalhes da Empresa */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detalhes da Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.filter(f => f.group === "company_details").map(renderField)}
          </div>
        </div>

        <Separator />

        {/* Section: Detalhes do Email (Conditional) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detalhes do Email</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(fields.find(f => f.name === "send_email")!)}
            {sendEmail && (
              <>
                {fields.filter(f => f.group === "email_details" && f.name !== "send_email").map(renderField)}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !userId || !companyDbId || !form.formState.isValid}>
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

export default AccountContactEditForm;