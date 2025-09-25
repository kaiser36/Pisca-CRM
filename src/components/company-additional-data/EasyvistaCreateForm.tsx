"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Easyvista, EasyvistaStatus } from '@/types/crm'; // Import EasyvistaStatus
import { insertEasyvista } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, CalendarIcon, PlusCircle, CheckCircle2, Hourglass, XCircle, FilePen, CircleDotDashed } from 'lucide-react'; // Import new icons
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EasyvistaCreateFormProps {
  companyExcelId: string;
  commercialName?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  "Nome comercial": z.string().nullable().optional(),
  "EV_ID": z.string().min(1, "EV_ID é obrigatório").nullable().optional(),
  "Status": z.enum(['Criado', 'Em validação', 'Em tratamento', 'Resolvido', 'Cancelado']).nullable().optional(), // UPDATED: Use z.enum
  "Account": z.string().nullable().optional(),
  "Titulo": z.string().nullable().optional(),
  "Descrição": z.string().nullable().optional(),
  "Anexos": z.string().nullable().optional(), // Simplified for now, can be extended to array input
  "Tipo de report": z.string().nullable().optional(),
  "PV": z.boolean().optional(),
  "Tipo EVS": z.string().nullable().optional(),
  "Urgência": z.enum(['Alto', 'Médio', 'Baixo']).nullable().optional(),
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
});

type FormData = z.infer<typeof formSchema>;

const EasyvistaCreateForm: React.FC<EasyvistaCreateFormProps> = ({
  companyExcelId,
  commercialName,
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
      "Nome comercial": commercialName || '',
      "EV_ID": '',
      "Status": 'Criado', // NEW: Default status
      "Account": '',
      "Titulo": '',
      "Descrição": '',
      "Anexos": '',
      "Tipo de report": '',
      "PV": false,
      "Tipo EVS": '',
      "Urgência": 'Médio',
      "Email Pisca": '',
      "Pass Pisca": '',
      "Client ID": '',
      "Client Secret": '',
      "Integração": '',
      "NIF da empresa": '',
      "Campanha": '',
      "Duração do acordo": '',
      "Plano do acordo": '',
      "Valor sem iva": 0,
      "ID_Proposta": '',
      "Account Armatis": '',
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar o Easyvista.");
      return;
    }
    if (!values["EV_ID"]) {
      showError("EV_ID é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newEasyvista: Omit<Easyvista, 'id' | 'created_at' | 'Ultima actualização' | 'Data Criação'> = {
        user_id: userId,
        company_excel_id: companyExcelId,
        "Nome comercial": values["Nome comercial"] || null,
        "EV_ID": values["EV_ID"],
        "Status": values["Status"] || null,
        "Account": values["Account"] || null,
        "Titulo": values["Titulo"] || null,
        "Descrição": values["Descrição"] || null,
        "Anexos": values["Anexos"] ? [values["Anexos"]] : null, // Convert single string to array
        "Tipo de report": values["Tipo de report"] || null,
        "PV": values["PV"] || false,
        "Tipo EVS": values["Tipo EVS"] || null,
        "Urgência": values["Urgência"] || null,
        "Email Pisca": values["Email Pisca"] || null,
        "Pass Pisca": values["Pass Pisca"] || null,
        "Client ID": values["Client ID"] || null,
        "Client Secret": values["Client Secret"] || null,
        "Integração": values["Integração"] || null,
        "NIF da empresa": values["NIF da empresa"] || null,
        "Campanha": values["Campanha"] || null,
        "Duração do acordo": values["Duração do acordo"] || null,
        "Plano do acordo": values["Plano do acordo"] || null,
        "Valor sem iva": values["Valor sem iva"] || null,
        "ID_Proposta": values["ID_Proposta"] || null,
        "Account Armatis": values["Account Armatis"] || null,
      };

      await insertEasyvista(newEasyvista);
      showSuccess("Easyvista criado com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar Easyvista:", error);
      showError(error.message || "Falha ao criar o Easyvista.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { value: EasyvistaStatus; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'Criado', label: 'Criado', icon: PlusCircle, color: 'text-blue-500' },
    { value: 'Em validação', label: 'Em validação', icon: FilePen, color: 'text-yellow-500' },
    { value: 'Em tratamento', label: 'Em tratamento', icon: Hourglass, color: 'text-orange-500' },
    { value: 'Resolvido', label: 'Resolvido', icon: CheckCircle2, color: 'text-green-500' },
    { value: 'Cancelado', label: 'Cancelado', icon: XCircle, color: 'text-red-500' },
  ];

  const urgencyOptions: { value: 'Alto' | 'Médio' | 'Baixo'; label: string; color: string }[] = [
    { value: 'Alto', label: 'Alto', color: 'bg-red-500' },
    { value: 'Médio', label: 'Médio', color: 'bg-blue-500' },
    { value: 'Baixo', label: 'Baixo', color: 'bg-green-500' },
  ];

  const fields = [
    { name: "Nome comercial", label: "Nome Comercial", type: "text" },
    { name: "Urgência", label: "Urgência", type: "select", options: urgencyOptions },
    { name: "EV_ID", label: "EV_ID", type: "text", required: true },
    { name: "Status", label: "Status", type: "select", options: statusOptions }, // UPDATED: Use statusOptions
    { name: "Account", label: "Account", type: "text" },
    { name: "Titulo", label: "Título", type: "text" },
    { name: "Descrição", label: "Descrição", type: "textarea", colSpan: 2 },
    { name: "Anexos", label: "Anexos (URL)", type: "url" }, // Single URL for now
    { name: "Tipo de report", label: "Tipo de Report", type: "select", options: ["Geral", "Específico a um cliente"] },
    { name: "PV", label: "PV (Informado ou não informado)", type: "boolean" },
    { name: "Tipo EVS", label: "Tipo EVS", type: "text" },
    { name: "Email Pisca", label: "Email Pisca", type: "email" },
    { name: "Pass Pisca", label: "Pass Pisca", type: "text" },
    { name: "Client ID", label: "Client ID", type: "text" },
    { name: "Client Secret", label: "Client Secret", type: "text" },
    { name: "Integração", label: "Integração", type: "text" },
    { name: "NIF da empresa", label: "NIF da Empresa", type: "text" },
    { name: "Campanha", label: "Campanha", type: "text" },
    { name: "Duração do acordo", label: "Duração do Acordo", type: "text" },
    { name: "Plano do acordo", label: "Plano do Acordo", type: "text" },
    { name: "Valor sem iva", label: "Valor sem IVA", type: "number" },
    { name: "ID_Proposta", label: "ID Proposta", type: "text" },
    { name: "Account Armatis", label: "Account Armatis", type: "text" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A criar Easyvista para a empresa com ID Excel: <span className="font-semibold">{companyExcelId}</span>
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
                    {field.type === "boolean" ? (
                      <Switch
                        checked={formField.value as boolean}
                        onCheckedChange={formField.onChange}
                      />
                    ) : field.type === "textarea" ? (
                      <Textarea
                        {...formField}
                        value={formField.value as string || ''}
                        onChange={formField.onChange}
                      />
                    ) : field.name === "Urgência" ? ( // Specific rendering for Urgência
                      <Select onValueChange={formField.onChange} defaultValue={formField.value as string}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecione um ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencyOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                <span className={cn("h-3 w-3 rounded-full mr-2", option.color)}></span>
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.name === "Status" ? ( // Specific rendering for Status
                      <Select onValueChange={formField.onChange} defaultValue={formField.value as string}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecione um ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => {
                            const Icon = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  <Icon className={cn("h-4 w-4 mr-2", option.color)} />
                                  {option.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        {...formField}
                        value={formField.value as string | number || ''}
                        onChange={(e) => {
                          if (field.type === "number") {
                            formField.onChange(e.target.value === '' ? null : Number(e.target.value));
                          } else {
                            formField.onChange(e.target.value);
                          }
                        }}
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
                A Criar...
              </>
            ) : (
              "Criar Easyvista"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EasyvistaCreateForm;