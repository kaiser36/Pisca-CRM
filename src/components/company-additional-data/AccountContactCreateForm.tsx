"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AccountContact, Account, Company } from '@/types/crm';
import { insertAccountContact, fetchAccounts, fetchCompaniesByExcelCompanyIds, fetchEmployeesByCompanyExcelId } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { getContactTypes, ContactType } from '@/integrations/supabase/services/contactTypeService';
import { getContactReportOptionsByContactTypeId, ContactReportOption } from '@/integrations/supabase/services/contactReportOptionService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, CalendarIcon, User, Building2, Store, Users, Briefcase, Phone, MessageSquare, FileText, LayoutList, Handshake, Mail, Type, Link, AtSign, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';

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
  report_text: z.array(z.string()).optional(),
  contact_date: z.date().nullable().optional(),
  contact_method: z.string().min(1, "Meio de Contacto é obrigatório").nullable().optional(),
  commercial_name: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
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
  const [availableAMs, setAvailableAMs] = useState<Account[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [availableStands, setAvailableStands] = useState<string[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_am: '',
      contact_type: '',
      report_text: [],
      contact_date: new Date(),
      contact_method: '',
      commercial_name: commercialName || '',
      company_name: companyName || '',
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
  const sendEmail = form.watch('send_email');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const types = await getContactTypes();
        setContactTypes(types);
      } catch (error) {
        console.error('Erro ao buscar tipos de contacto:', error);
        showError('Erro ao carregar tipos de contacto');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (userId && companyExcelId) {
        setIsLoadingData(true);
        try {
          const [companies, fetchedAMs] = await Promise.all([
            fetchCompaniesByExcelCompanyIds(userId, [companyExcelId]),
            fetchAccounts(userId)
          ]);
          
          setAvailableAMs(fetchedAMs);
          const currentCompany = companies.find(c => c.Company_id === companyExcelId);

          if (currentCompany) {
            setCompanyDbId(currentCompany.id || null);
            if (currentCompany.AM_Current) form.setValue('account_am', currentCompany.AM_Current);
            
            const standNames = currentCompany.stands.map(s => s.Stand_Name).filter((n): n is string => !!n);
            setAvailableStands(standNames);
            
            const employees = await fetchEmployeesByCompanyExcelId(userId, companyExcelId);
            setAvailableEmployees(employees.map(e => e.nome_colaborador));
          } else {
            showError(`Empresa com ID Excel '${companyExcelId}' não encontrada.`);
            setCompanyDbId(null);
          }
        } catch (error: any) {
          showError(`Falha ao carregar dados: ${error.message}`);
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    loadCompanyData();
  }, [userId, companyExcelId, form]);

  useEffect(() => {
    const fetchReportOptions = async () => {
      form.setValue('report_text', []);
      if (selectedContactTypeName) {
        const contactType = contactTypes.find(type => type.name === selectedContactTypeName);
        if (contactType?.id) {
          try {
            const options = await getContactReportOptionsByContactTypeId(contactType.id);
            const dynamicOptions = options.map(opt => ({ value: opt.report_text, label: opt.report_text }));
            
            const staticOptions = [
                { value: 'Destaques', label: 'Destaques' },
                { value: 'Plano não renovado', label: 'Plano não renovado' },
            ];
            
            const combinedOptions = [...dynamicOptions, ...staticOptions];
            const uniqueOptions = Array.from(new Map(combinedOptions.map(item => [item.value, item])).values());

            setReportOptions(uniqueOptions);
          } catch (error) {
            showError('Erro ao carregar opções de relatório');
            setReportOptions([]);
          }
        } else {
          setReportOptions([]);
        }
      } else {
        setReportOptions([]);
      }
    };
    fetchReportOptions();
  }, [selectedContactTypeName, contactTypes, form]);

  const onSubmit = async (values: FormData) => {
    if (!userId || !companyDbId) {
      showError("Utilizador ou empresa inválida. Não é possível guardar o contacto.");
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
        report_text: values.report_text?.join(', ') || null,
        contact_date: values.contact_date?.toISOString() || null,
        contact_method: values.contact_method || null,
        commercial_name: values.commercial_name || null,
        company_name: values.company_name || null,
        crm_id: null,
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
      showSuccess("Contacto criado com sucesso!");
      onSave();
    } catch (error: any) {
      showError(error.message || "Falha ao criar o contacto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueContactTypeNames = Array.from(new Set(contactTypes.map(type => type.name))).map(name => ({ value: name, label: name }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 md:p-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Adicionar Novo Contacto</h2>
          <p className="text-muted-foreground">
            A registar um contacto para a empresa: <span className="font-semibold text-primary">{commercialName || companyName}</span>
          </p>
          {!companyDbId && !isLoadingData && <p className="text-sm text-destructive">Aviso: Empresa não encontrada no CRM. O contacto não pode ser guardado.</p>}
        </div>

        <Card>
          <CardHeader><CardTitle>Informações do Contacto</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="contact_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Contacto</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full pl-10 text-left font-normal", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="contact_method" render={({ field }) => (
              <FormItem>
                <FormLabel>Meio de Contacto</FormLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger className="pl-10"><SelectValue placeholder="Selecione o meio" /></SelectTrigger>
                    <SelectContent>{["Telefone", "Email", "Presencial", "Videoconferência", "Outro"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="contact_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Contacto</FormLabel>
                <div className="relative">
                  <LayoutList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Combobox options={uniqueContactTypeNames} value={field.value} onChange={field.onChange} placeholder="Selecione o tipo" searchPlaceholder="Pesquisar tipo..." emptyMessage="Nenhum tipo encontrado." />
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="report_text" render={({ field }) => (
              <FormItem>
                <FormLabel>Report</FormLabel>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <MultiSelect
                    options={reportOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Selecione o(s) report(s)"
                    searchPlaceholder="Pesquisar report..."
                    emptyMessage="Nenhum report encontrado."
                    disabled={reportOptions.length === 0}
                    className="pl-10"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <div className="md:col-span-2">
              <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} value={field.value || ''} placeholder="Descreva o assunto do contacto..." className="pl-10" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Detalhes da Empresa e Pessoas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="account_am" render={({ field }) => (
              <FormItem>
                <FormLabel>AM da Conta</FormLabel>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingData}>
                    <SelectTrigger className="pl-10"><SelectValue placeholder="Selecione um AM" /></SelectTrigger>
                    <SelectContent>{availableAMs.map(am => am.am ? <SelectItem key={am.id} value={am.am}>{am.am}</SelectItem> : null)}</SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="contact_person_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Pessoa de Contacto</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingData || availableEmployees.length === 0}>
                    <SelectTrigger className="pl-10"><SelectValue placeholder="Selecione um colaborador" /></SelectTrigger>
                    <SelectContent>{availableEmployees.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="stand_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Stand</FormLabel>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingData || availableStands.length === 0}>
                    <SelectTrigger className="pl-10"><SelectValue placeholder="Selecione um stand" /></SelectTrigger>
                    <SelectContent>{availableStands.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="company_group" render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo da Empresa</FormLabel>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input {...field} value={field.value || ''} placeholder="Ex: Grupo Auto" className="pl-10" />
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="account_armatis" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Armatis</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input {...field} value={field.value || ''} placeholder="Nome do account" className="pl-10" />
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="quarter" render={({ field }) => (
              <FormItem>
                <FormLabel>Trimestre</FormLabel>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input {...field} value={field.value || ''} placeholder="Ex: Q1 2024" className="pl-10" />
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="is_credibom_partner" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel>É Parceiro Credibom?</FormLabel>
                  <p className="text-sm text-muted-foreground">Indica se a empresa tem parceria ativa com a Credibom.</p>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Campanha de Email</CardTitle>
                <CardDescription>Ative para enviar um email como parte deste contacto.</CardDescription>
              </div>
              <FormField control={form.control} name="send_email" render={({ field }) => (
                <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
              )}/>
            </div>
          </CardHeader>
          {sendEmail && (
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <FormField control={form.control} name="email_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} value={field.value || ''} placeholder="Ex: Proposta, Follow-up" className="pl-10" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="email_subject" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto do Email</FormLabel>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} value={field.value || ''} placeholder="Assunto do email a enviar" className="pl-10" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="sending_email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Envio</FormLabel>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} value={field.value || ''} type="email" placeholder="O seu email de envio" className="pl-10" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="attachment_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Anexo</FormLabel>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} value={field.value || ''} type="url" placeholder="https://..." className="pl-10" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="md:col-span-2">
                <FormField control={form.control} name="email_body" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corpo do Email</FormLabel>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea {...field} value={field.value || ''} placeholder="Escreva a sua mensagem..." className="pl-10 min-h-[120px]" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || !userId || !companyDbId}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A Guardar...</> : "Guardar Contacto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccountContactCreateForm;