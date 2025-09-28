"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CompanyAdditionalExcelData, Account } from '@/types/crm';
import { upsertCompanyAdditionalExcelData } from '@/integrations/supabase/services/companyAdditionalExcelDataService'; // Corrected import
import { fetchAccounts, fetchCompaniesByExcelCompanyIds } from '@/integrations/supabase/utils'; // Import fetchAccounts and fetchCompaniesByExcelCompanyIds
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components

interface CompanyAdditionalEditFormProps {
  company: CompanyAdditionalExcelData;
  onSave: () => void;
  onCancel: () => void;
}

// Define o esquema de validação com Zod
const formSchema = z.object({
  "Nome Comercial": z.string().nullable().optional(),
  "Email da empresa": z.string().email("Email inválido").nullable().optional().or(z.literal('')),
  "STAND_POSTAL_CODE": z.string().nullable().optional(),
  "Distrito": z.string().nullable().optional(),
  "Cidade": z.string().nullable().optional(),
  "Morada": z.string().nullable().optional(),
  "AM_OLD": z.string().nullable().optional(),
  "AM": z.string().nullable().optional(),
  "Stock STV": z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  "API": z.string().nullable().optional(),
  "Site": z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  "Stock na empresa": z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo").nullable().optional()
  ),
  "Logotipo": z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  "Classificação": z.string().nullable().optional(),
  "Percentagem de Importados": z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").max(100, "Não pode ser superior a 100").nullable().optional()
  ),
  "Onde compra as viaturas": z.string().nullable().optional(),
  "Concorrencia": z.string().nullable().optional(),
  "Investimento redes sociais": z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ),
  "Investimento em portais": z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "Não pode ser negativo").nullable().optional()
  ),
  "Mercado b2b": z.boolean().optional(),
  "Utiliza CRM": z.boolean().optional(),
  "Qual o CRM": z.string().nullable().optional(),
  "Plano Indicado": z.string().nullable().optional(),
  "Mediador de credito": z.boolean().optional(),
  "Link do Banco de Portugal": z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  "Financeiras com acordo": z.string().nullable().optional(),
  "Data ultima visita": z.string().nullable().optional(), // Pode ser um Date, mas para simplificar, mantemos string
  "Grupo": z.string().nullable().optional(),
  "Marcas representadas": z.string().nullable().optional(),
  "Tipo de empresa": z.string().nullable().optional(),
  "Quer CT": z.boolean().optional(),
  "Quer ser parceiro Credibom": z.boolean().optional(),
  "Autobiz": z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CompanyAdditionalEditForm: React.FC<CompanyAdditionalEditFormProps> = ({ company, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]); // State for accounts
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

  // Fetch accounts for the AM select field
  useEffect(() => {
    const loadAccounts = async () => {
      if (!userId) return;
      try {
        const fetchedAccounts = await fetchAccounts(userId);
        setAccounts(fetchedAccounts.filter(acc => acc.am !== null && acc.am.trim() !== ''));
      } catch (err: any) {
        console.error("Erro ao carregar contas de AM:", err);
        showError(err.message || "Falha ao carregar a lista de AMs.");
      }
    };

    if (userId) {
      loadAccounts();
    }
  }, [userId]);

  // NEW: Fetch company_db_id based on company.excel_company_id and userId
  useEffect(() => {
    const fetchCompanyDbId = async () => {
      if (userId && company.excel_company_id) {
        const companies = await fetchCompaniesByExcelCompanyIds(userId, [company.excel_company_id]);
        const currentCompany = companies.find(c => c.Company_id === company.excel_company_id);
        setCompanyDbId(currentCompany?.id || null);
      }
    };
    fetchCompanyDbId();
  }, [userId, company.excel_company_id]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "Nome Comercial": company["Nome Comercial"] || '',
      "Email da empresa": company["Email da empresa"] || '',
      "STAND_POSTAL_CODE": company["STAND_POSTAL_CODE"] || '',
      "Distrito": company["Distrito"] || '',
      "Cidade": company["Cidade"] || '',
      "Morada": company["Morada"] || '',
      "AM_OLD": company["AM_OLD"] || '',
      "AM": company["AM"] || '',
      "Stock STV": company["Stock STV"] || 0,
      "API": company["API"] || '',
      "Site": company["Site"] || '',
      "Stock na empresa": company["Stock na empresa"] || 0,
      "Logotipo": company["Logotipo"] || '',
      "Classificação": company["Classificação"] || '',
      "Percentagem de Importados": company["Percentagem de Importados"] || 0,
      "Onde compra as viaturas": company["Onde compra as viaturas"] || '',
      "Concorrencia": company["Concorrencia"] || '',
      "Investimento redes sociais": company["Investimento redes sociais"] || 0,
      "Investimento em portais": company["Investimento em portais"] || 0,
      "Mercado b2b": company["Mercado b2b"] || false,
      "Utiliza CRM": company["Utiliza CRM"] || false,
      "Qual o CRM": company["Qual o CRM"] || '',
      "Plano Indicado": company["Plano Indicado"] || '',
      "Mediador de credito": company["Mediador de credito"] || false,
      "Link do Banco de Portugal": company["Link do Banco de Portugal"] || '',
      "Financeiras com acordo": company["Financeiras com acordo"] || '',
      "Data ultima visita": company["Data ultima visita"] || '',
      "Grupo": company["Grupo"] || '',
      "Marcas representadas": company["Marcas representadas"] || '',
      "Tipo de empresa": company["Tipo de empresa"] || '',
      "Quer CT": company["Quer CT"] || false,
      "Quer ser parceiro Credibom": company["Quer ser parceiro Credibom"] || false,
      "Autobiz": company["Autobiz"] || '',
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }
    if (!companyDbId) { // NEW: Check if companyDbId is available
      showError("Não foi possível associar os dados adicionais a uma empresa válida. Por favor, verifique o ID Excel da empresa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData: CompanyAdditionalExcelData = {
        ...company, // Manter campos existentes como id, user_id, excel_company_id, created_at
        ...values,
        user_id: userId, // Garantir que o user_id está correto
        excel_company_id: company.excel_company_id, // Garantir que o excel_company_id está correto
        company_db_id: companyDbId, // NEW: Include company_db_id
      };

      await upsertCompanyAdditionalExcelData([updatedData], userId);
      showSuccess("Dados da empresa adicional atualizados com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao atualizar dados da empresa adicional:", error);
      showError(error.message || "Falha ao atualizar os dados da empresa adicional.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "Nome Comercial", label: "Nome Comercial", type: "text" },
    { name: "Email da empresa", label: "Email da empresa", type: "email" },
    { name: "STAND_POSTAL_CODE", label: "Código Postal do Stand", type: "text" },
    { name: "Distrito", label: "Distrito", type: "text" },
    { name: "Cidade", label: "Cidade", type: "text" },
    { name: "Morada", label: "Morada", type: "text" },
    { name: "AM_OLD", label: "AM Antigo", type: "text" },
    { name: "AM", label: "AM Atual", type: "select", options: accounts.map(acc => acc.am).filter((am): am is string => am !== null && am.trim() !== '') }, // Changed to select
    { name: "Stock STV", label: "Stock STV", type: "number" },
    { name: "API", label: "API", type: "text" },
    { name: "Site", label: "Site", type: "url" },
    { name: "Stock na empresa", label: "Stock na empresa", type: "number" },
    { name: "Logotipo", label: "Logotipo (URL)", type: "url" },
    { name: "Classificação", label: "Classificação", type: "text" },
    { name: "Percentagem de Importados", label: "Percentagem de Importados", type: "number" },
    { name: "Onde compra as viaturas", label: "Onde compra as viaturas", type: "text" },
    { name: "Concorrencia", label: "Concorrência", type: "text" },
    { name: "Investimento redes sociais", label: "Investimento Redes Sociais", type: "number" },
    { name: "Investimento em portais", label: "Investimento em Portais", type: "number" },
    { name: "Mercado b2b", label: "Mercado B2B", type: "boolean" },
    { name: "Utiliza CRM", label: "Utiliza CRM", type: "boolean" },
    { name: "Qual o CRM", label: "Qual o CRM", type: "text" },
    { name: "Plano Indicado", label: "Plano Indicado", type: "text" },
    { name: "Mediador de credito", label: "Mediador de Crédito", type: "boolean" },
    { name: "Link do Banco de Portugal", label: "Link do Banco de Portugal", type: "url" },
    { name: "Financeiras com acordo", label: "Financeiras com Acordo", type: "textarea" },
    { name: "Data ultima visita", label: "Data Última Visita", type: "text" },
    { name: "Grupo", label: "Grupo", type: "text" },
    { name: "Marcas representadas", label: "Marcas Representadas", type: "textarea" },
    { name: "Tipo de empresa", label: "Tipo de Empresa", type: "text" },
    { name: "Quer CT", label: "Quer CT", type: "boolean" },
    { name: "Quer ser parceiro Credibom", label: "Quer ser Parceiro Credibom", type: "boolean" },
    { name: "Autobiz", label: "Autobiz", type: "textarea" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          A editar dados adicionais para a empresa com ID Excel: <span className="font-semibold">{company.excel_company_id}</span>
        </p>
        {!companyDbId && ( // NEW: Alert if companyDbId is missing
          <p className="text-sm text-red-500">
            Não foi possível encontrar a empresa no CRM principal com o ID Excel fornecido. Os dados adicionais não poderão ser atualizados.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof FormData}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
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
                    ) : field.type === "select" ? (
                      <Select
                        onValueChange={(value) => formField.onChange(value === "null-am" ? null : value)} // Handle 'null-am'
                        value={formField.value === null ? "null-am" : (formField.value as string)} // Ensure value is never empty string
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecione um ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null-am">Nenhum</SelectItem> {/* Add a "None" option */}
                          {field.options?.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
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

export default CompanyAdditionalEditForm;