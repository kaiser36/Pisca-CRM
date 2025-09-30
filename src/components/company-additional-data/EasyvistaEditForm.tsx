"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Easyvista, EasyvistaStatus, Account, EasyvistaType, Company, CompanyAdditionalExcelData } from '@/types/crm';
import { upsertEasyvistas, fetchAccounts, fetchEasyvistaTypes, fetchCompaniesByExcelCompanyIds, fetchCompanyAdditionalExcelData } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, PlusCircle, CheckCircle2, Hourglass, XCircle, FilePen, FileText, AlignLeft, CircleDotDashed, AlertTriangle, Briefcase, ClipboardList, Tag, Paperclip, ToggleRight, Mail, KeyRound, Fingerprint, Lock, FileCode, Building, Percent, ClipboardCheck, FileClock, FileBarChart, DollarSign, Info, Upload, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EasyvistaEditFormProps {
  easyvista: Easyvista;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  "Titulo": z.string().min(1, "O título é obrigatório"),
  "Descrição": z.string().nullable().optional(),
  "Status": z.enum(['Criado', 'Em validação', 'Em tratamento', 'Resolvido', 'Cancelado']).default('Criado'),
  "Urgência": z.enum(['Alto', 'Médio', 'Baixo']).default('Médio'),
  "Nome comercial": z.string().nullable().optional(),
  "Account": z.string().nullable().optional(),
  "Tipo de report": z.string().nullable().optional(),
  "Tipo EVS": z.string().nullable().optional(),
  "PV": z.boolean().optional(),
  "Email Pisca": z.string().email("Email inválido").nullable().optional().or(z.literal('')),
  "Pass Pisca": z.string().nullable().optional(),
  "Client ID": z.string().nullable().optional(),
  "Client Secret": z.string().nullable().optional(),
  "Integração": z.string().nullable().optional(),
  "NIF da empresa": z.string().nullable().optional(),
  "Campanha": z.string().nullable().optional(),
  "Duração do acordo": z.string().nullable().optional(),
  "Plano do acordo": z.string().nullable().optional(),
  "Valor sem iva": z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ),
  "ID_Proposta": z.string().nullable().optional(),
  "Account Armatis": z.string().nullable().optional(),
  "Anexos": z.any().optional(), // For file input
});

type FormData = z.infer<typeof formSchema>;

const EasyvistaEditForm: React.FC<EasyvistaEditFormProps> = ({ easyvista, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [availableAMs, setAvailableAMs] = useState<Account[]>([]);
  const [isAMsLoading, setIsAMsLoading] = useState(true);
  const [easyvistaTypes, setEasyvistaTypes] = useState<EasyvistaType[]>([]);
  const [isTypesLoading, setIsTypesLoading] = useState(true);
  const [selectedEasyvistaTypeFields, setSelectedEasyvistaTypeFields] = useState<string[] | null>(null);
  const [companyDbId, setCompanyDbId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [additionalCompanyDetails, setAdditionalCompanyDetails] = useState<CompanyAdditionalExcelData | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(easyvista.Anexos || []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "Nome comercial": easyvista["Nome comercial"] || '',
      "Status": easyvista["Status"] || 'Criado',
      "Account": easyvista["Account"] || '',
      "Titulo": easyvista["Titulo"] || '',
      "Descrição": easyvista["Descrição"] || '',
      "Tipo de report": easyvista["Tipo de report"] || '',
      "PV": easyvista["PV"] || false,
      "Tipo EVS": easyvista["Tipo EVS"] || '',
      "Urgência": easyvista["Urgência"] || 'Médio',
      "Email Pisca": easyvista["Email Pisca"] || '',
      "Pass Pisca": easyvista["Pass Pisca"] || '',
      "Client ID": easyvista["Client ID"] || '',
      "Client Secret": easyvista["Client Secret"] || '',
      "Integração": easyvista["Integração"] || '',
      "NIF da empresa": easyvista["NIF da empresa"] || '',
      "Campanha": easyvista["Campanha"] || '',
      "Duração do acordo": easyvista["Duração do acordo"] || '',
      "Plano do acordo": easyvista["Plano do acordo"] || '',
      "Valor sem iva": easyvista["Valor sem iva"] || 0,
      "ID_Proposta": easyvista["ID_Proposta"] || '',
      "Account Armatis": easyvista["Account Armatis"] || '',
      "Anexos": easyvista.Anexos?.[0] || null,
    },
  });

  const { watch, setValue } = form;
  const selectedTipoEVS = watch("Tipo EVS");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachmentFile(event.target.files[0]);
      setValue('Anexos', event.target.files[0].name);
      setExistingAttachments([]); // Clear existing when new one is selected
    } else {
      setAttachmentFile(null);
      setValue('Anexos', null);
    }
  };

  const uploadAttachment = async (file: File, userId: string, companyExcelId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${companyExcelId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('easyvista-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading attachment:', uploadError);
      throw new Error(`Falha ao carregar o anexo: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('easyvista-attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!userId || !easyvista.company_excel_id) return;
      setIsAMsLoading(true);
      setIsTypesLoading(true);
      try {
        const companies = await fetchCompaniesByExcelCompanyIds(userId, [easyvista.company_excel_id]);
        const currentCompany = companies.find(c => c.Company_id === easyvista.company_excel_id);
        setCompanyDetails(currentCompany || null);
        setCompanyDbId(currentCompany?.id || null);

        const { data: additionalData } = await fetchCompanyAdditionalExcelData(userId, 1, 1, easyvista.company_excel_id);
        const currentAdditionalData = additionalData.find(c => c.excel_company_id === easyvista.company_excel_id);
        setAdditionalCompanyDetails(currentAdditionalData || null);

        const resolvedCommercialName = currentAdditionalData?.["Nome Comercial"] || currentCompany?.Commercial_Name || currentCompany?.Company_Name || null;
        setValue("Nome comercial", resolvedCommercialName);

        const [fetchedAMs, fetchedTypes] = await Promise.all([
          fetchAccounts(userId),
          fetchEasyvistaTypes(userId)
        ]);

        setAvailableAMs(fetchedAMs.filter(am => am.am !== null && am.am.trim() !== ''));
        setEasyvistaTypes(fetchedTypes);

        if (easyvista["Tipo EVS"]) {
          const initialType = fetchedTypes.find(type => type.name === easyvista["Tipo EVS"]);
          setSelectedEasyvistaTypeFields(initialType?.display_fields || null);
        } else {
          setSelectedEasyvistaTypeFields(null);
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados para o formulário Easyvista:", err);
        showError(err.message || "Falha ao carregar dados necessários.");
      } finally {
        setIsAMsLoading(false);
        setIsTypesLoading(false);
      }
    };
    if (userId) loadData();
  }, [userId, easyvista.company_excel_id, setValue]);

  useEffect(() => {
    if (selectedTipoEVS && easyvistaTypes.length > 0) {
      const type = easyvistaTypes.find(t => t.name === selectedTipoEVS);
      setSelectedEasyvistaTypeFields(type?.display_fields || null);
    } else {
      setSelectedEasyvistaTypeFields(null);
    }
  }, [selectedTipoEVS, easyvistaTypes]);

  const onSubmit = async (values: FormData) => {
    if (!userId || !companyDbId || !easyvista.company_excel_id) {
      showError("Utilizador ou empresa inválida. Não é possível guardar o registo.");
      return;
    }

    setIsSubmitting(true);
    let finalAttachments: string[] = existingAttachments;

    try {
      if (attachmentFile) {
        const newUrl = await uploadAttachment(attachmentFile, userId, easyvista.company_excel_id);
        finalAttachments = [newUrl]; // Replace with new attachment
      }

      const updatedEasyvista: Easyvista = {
        ...easyvista,
        ...values,
        user_id: userId,
        company_db_id: companyDbId,
        "Anexos": finalAttachments.length > 0 ? finalAttachments : null,
      };

      await upsertEasyvistas([updatedEasyvista], userId);
      showSuccess("Easyvista atualizado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar Easyvista:", error);
      showError(error.message || "Falha ao atualizar o Easyvista.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'Criado', label: 'Criado', icon: PlusCircle, color: 'text-blue-500' },
    { value: 'Em validação', label: 'Em validação', icon: FilePen, color: 'text-yellow-500' },
    { value: 'Em tratamento', label: 'Em tratamento', icon: Hourglass, color: 'text-orange-500' },
    { value: 'Resolvido', label: 'Resolvido', icon: CheckCircle2, color: 'text-green-500' },
    { value: 'Cancelado', label: 'Cancelado', icon: XCircle, color: 'text-red-500' },
  ];

  const urgencyOptions = [
    { value: 'Alto', label: 'Alto', color: 'bg-red-500' },
    { value: 'Médio', label: 'Médio', color: 'bg-blue-500' },
    { value: 'Baixo', label: 'Baixo', color: 'bg-green-500' },
  ];

  const optionalFieldsConfig = {
    "Email Pisca": { icon: Mail, type: "email" }, "Pass Pisca": { icon: KeyRound, type: "text" },
    "Client ID": { icon: Fingerprint, type: "text" }, "Client Secret": { icon: Lock, type: "text" },
    "Integração": { icon: FileCode, type: "text" }, "NIF da empresa": { icon: Building, type: "text" },
    "Campanha": { icon: Percent, type: "text" }, "Duração do acordo": { icon: FileClock, type: "text" },
    "Plano do acordo": { icon: FileBarChart, type: "text" }, "Valor sem iva": { icon: DollarSign, type: "number" },
    "ID_Proposta": { icon: Info, type: "text" }, "Account Armatis": { icon: Briefcase, type: "text" },
  };

  const companyDisplayName = additionalCompanyDetails?.["Nome Comercial"]?.trim() || companyDetails?.Commercial_Name?.trim() || companyDetails?.Company_Name || easyvista.company_excel_id;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 md:p-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Editar Registo Easyvista</h2>
          <p className="text-muted-foreground">
            Para a empresa <span className="font-semibold text-primary">{companyDisplayName}</span> (ID: <span className="font-semibold">{easyvista.company_excel_id}</span>)
          </p>
          {!companyDbId && !isAMsLoading && <p className="text-sm text-destructive">Aviso: Empresa não encontrada no CRM. O registo não pode ser guardado.</p>}
        </div>

        <Card>
          <CardHeader><CardTitle>Informações Principais</CardTitle><CardDescription>Detalhes essenciais do registo.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField control={form.control} name="Titulo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input {...field} placeholder="Título do registo" className="pl-10" /></div>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <div className="md:col-span-2">
              <FormField control={form.control} name="Descrição" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <div className="relative"><AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Textarea {...field} placeholder="Descreva detalhadamente o registo..." className="pl-10 min-h-[100px]" /></div>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="Status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <div className="relative"><CircleDotDashed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Select onValueChange={field.onChange} value={field.value}><SelectTrigger className="pl-10"><SelectValue placeholder="Selecione um status" /></SelectTrigger><SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}><div className="flex items-center"><o.icon className={cn("h-4 w-4 mr-2", o.color)} />{o.label}</div></SelectItem>)}</SelectContent></Select></div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="Urgência" render={({ field }) => (
              <FormItem>
                <FormLabel>Urgência</FormLabel>
                <div className="relative"><AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Select onValueChange={field.onChange} value={field.value}><SelectTrigger className="pl-10"><SelectValue placeholder="Selecione a urgência" /></SelectTrigger><SelectContent>{urgencyOptions.map(o => <SelectItem key={o.value} value={o.value}><div className="flex items-center"><span className={cn("h-3 w-3 rounded-full mr-2", o.color)}></span>{o.label}</div></SelectItem>)}</SelectContent></Select></div>
                <FormMessage />
              </FormItem>
            )}/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Associação e Detalhes</CardTitle><CardDescription>Contexto do registo e a quem se destina.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="Nome comercial" render={({ field }) => (<FormItem><FormLabel>Nome Comercial</FormLabel><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input {...field} readOnly className="pl-10 bg-muted" /></div><FormMessage /></FormItem>)}/>
            <FormField control={form.control} name="Account" render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Select onValueChange={field.onChange} value={field.value || ''} disabled={isAMsLoading || availableAMs.length === 0}><SelectTrigger className="pl-10"><SelectValue placeholder="Selecione um AM" /></SelectTrigger><SelectContent>{availableAMs.map(am => <SelectItem key={am.id} value={am.am || ''}>{am.am}</SelectItem>)}</SelectContent></Select></div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="Tipo de report" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Report</FormLabel>
                <div className="relative"><ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Select onValueChange={field.onChange} value={field.value || ''}><SelectTrigger className="pl-10"><SelectValue placeholder="Selecione um tipo" /></SelectTrigger><SelectContent>{["Geral", "Específico a um cliente"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="Tipo EVS" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo EVS</FormLabel>
                <div className="relative"><Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Select onValueChange={field.onChange} value={field.value || ''} disabled={isTypesLoading || easyvistaTypes.length === 0}><SelectTrigger className="pl-10"><SelectValue placeholder="Selecione um Tipo EVS" /></SelectTrigger><SelectContent>{easyvistaTypes.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="PV" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                <div className="space-y-0.5"><FormLabel>PV (Informado ou não informado)</FormLabel></div>
                <FormControl><div className="relative flex items-center gap-2"><ToggleRight className="h-4 w-4 text-muted-foreground" /><Switch checked={field.value} onCheckedChange={field.onChange} /></div></FormControl>
              </FormItem>
            )}/>
          </CardContent>
        </Card>

        {selectedEasyvistaTypeFields && selectedEasyvistaTypeFields.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Campos Adicionais para {selectedTipoEVS}</CardTitle><CardDescription>Informações específicas para este tipo de registo.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedEasyvistaTypeFields.map(fieldName => {
                const config = optionalFieldsConfig[fieldName as keyof typeof optionalFieldsConfig];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <FormField key={fieldName} control={form.control} name={fieldName as keyof FormData} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldName}</FormLabel>
                      <div className="relative"><Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type={config.type} {...field} value={field.value || ''} className="pl-10" /></div>
                      <FormMessage />
                    </FormItem>
                  )}/>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Anexos</CardTitle><CardDescription>Anexe um ficheiro relevante para este registo.</CardDescription></CardHeader>
          <CardContent>
            {existingAttachments.length > 0 && (
              <div className="mb-4 space-y-2">
                <FormLabel>Anexo Atual</FormLabel>
                {existingAttachments.map((url, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate flex-1">
                      {url.split('/').pop()}
                    </a>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExistingAttachments(existingAttachments.filter((_, i) => i !== index))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <FormField control={form.control} name="Anexos" render={({ field }) => (
              <FormItem>
                <FormLabel>Novo Ficheiro (substituirá o atual)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input id="attachment-upload" type="file" className="absolute h-full w-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <label htmlFor="attachment-upload" className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted">
                      {attachmentFile ? (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span>{attachmentFile.name}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); setAttachmentFile(null); form.setValue('Anexos', null); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Upload className="h-6 w-6" />
                          <span>Clique ou arraste para carregar</span>
                        </div>
                      )}
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || !userId || !companyDbId || !form.formState.isValid}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A Guardar...</> : "Guardar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EasyvistaEditForm;