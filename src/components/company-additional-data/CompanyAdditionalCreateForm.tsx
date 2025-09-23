"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CompanyAdditionalExcelData, Company as CrmCompanyType } from '@/types/crm'; // Renamed Company to CrmCompanyType to avoid conflict
import { upsertCompanyAdditionalExcelData, fetchCompanyByEmail } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/use-debounce'; // Import useDebounce

interface CompanyAdditionalCreateFormProps {
  onSave: () => void;
  onCancel: () => void;
}

// Define o esquema de validação com Zod
const formSchema = z.object({
  // excel_company_id will be generated, not directly input
  "Nome Comercial": z.string().nullable().optional(),
  "Email da empresa": z.string().email("Email inválido").min(1, "Email da empresa é obrigatório para gerar o ID.").nullable().optional().or(z.literal('')), // This will be used for lookup
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
  "Data ultima visita": z.string().nullable().optional(),
  "Grupo": z.string().nullable().optional(),
  "Marcas representadas": z.string().nullable().optional(),
  "Tipo de empresa": z.string().nullable().optional(),
  "Quer CT": z.boolean().optional(),
  "Quer ser parceiro Credibom": z.boolean().optional(),
  "Autobiz": z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CompanyAdditionalCreateForm: React.FC<CompanyAdditionalCreateFormProps> = ({ onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [generatedExcelCompanyId, setGeneratedExcelCompanyId] = useState<string | null>(null);
  const [isProvisional, setIsProvisional] = useState(false);
  const [isLookingUpEmail, setIsLookingUpEmail] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "Nome Comercial": '',
      "Email da empresa": '',
      "STAND_POSTAL_CODE": '',
      "Distrito": '',
      "Cidade": '',
      "Morada": '',
      "AM_OLD": '',
      "AM": '',
      "Stock STV": 0,
      "API": '',
      "Site": '',
      "Stock na empresa": 0,
      "Logotipo": '',
      "Classificação": '',
      "Percentagem de Importados": 0,
      "Onde compra as viaturas": '',
      "Concorrencia": '',
      "Investimento redes sociais": 0,
      "Investimento em portais": 0,
      "Mercado b2b": false,
      "Utiliza CRM": false,
      "Qual o CRM": '',
      "Plano Indicado": '',
      "Mediador de credito": false,
      "Link do Banco de Portugal": '',
      "Financeiras com acordo": '',
      "Data ultima visita": '',
      "Grupo": '',
      "Marcas representadas": '',
      "Tipo de empresa": '',
      "Quer CT": false,
      "Quer ser parceiro Credibom": false,
      "Autobiz": '',
    },
  });

  const companyEmail = form.watch("Email da empresa");
  const debouncedCompanyEmail = useDebounce(companyEmail, 700); // Debounce email input

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

  const generateProvisionalId = useCallback(() => {
    const timestamp = Date.now();
    return `P-${timestamp}`;
  }, []);

  useEffect(() => {
    const lookupCompanyId = async () => {
      if (!userId || !debouncedCompanyEmail || !z.string().email().safeParse(debouncedCompanyEmail).success) {
        setGeneratedExcelCompanyId(generateProvisionalId());
        setIsProvisional(true);
        return;
      }

      setIsLookingUpEmail(true);
      try {
        const crmCompany = await fetchCompanyByEmail(userId, debouncedCompanyEmail);
        if (crmCompany) {
          setGeneratedExcelCompanyId(crmCompany.Company_id);
          setIsProvisional(false);
          showSuccess(`Email encontrado no CRM. ID da Empresa: ${crmCompany.Company_id}`);
        } else {
          setGeneratedExcelCompanyId(generateProvisionalId());
          setIsProvisional(true);
          showError("Email não encontrado no CRM. Gerado ID provisório.");
        }
      } catch (err: any) {
        console.error("Error during email lookup:", err);
        showError(err.message || "Erro ao procurar email no CRM.");
        setGeneratedExcelCompanyId(generateProvisionalId());
        setIsProvisional(true);
      } finally {
        setIsLookingUpEmail(false);
      }
    };

    lookupCompanyId();
  }, [userId, debouncedCompanyEmail, generateProvisionalId]);

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar a empresa.");
      return;
    }
    if (!generatedExcelCompanyId) {
      showError("Não foi possível gerar um ID para a empresa. Por favor, insira um email válido e tente novamente.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newCompanyData: CompanyAdditionalExcelData = {
        user_id: userId,
        excel_company_id: generatedExcelCompanyId, // Use the generated ID
        "Nome Comercial": values["Nome Comercial"],
        "Email da empresa": values["Email da empresa"],
        "STAND_POSTAL_CODE": values["STAND_POSTAL_CODE"],
        "Distrito": values["Distrito"],
        "Cidade": values["Cidade"],
        "Morada": values["Morada"],
        "AM_OLD": values["AM_OLD"],
        "AM": values["AM"],
        "Stock STV": values["Stock STV"],
        "API": values["API"],
        "Site": values["Site"],
        "Stock na empresa": values["Stock na empresa"],
        "Logotipo": values["Logotipo"],
        "Classificação": values["Classificação"],
        "Percentagem de Importados": values["Percentagem de Importados"],
        "Onde compra as viaturas": values["Onde compra as viaturas"],
        "Concorrencia": values["Concorrencia"],
        "Investimento redes sociais": values["Investimento redes sociais"],
        "Investimento em portais": values["Investimento em portais"],
        "Mercado b2b": values["Mercado b2b"],
        "Utiliza CRM": values["Utiliza CRM"],
        "Qual o CRM": values["Qual o CRM"],
        "Plano Indicado": values["Plano Indicado"],
        "Mediador de credito": values["Mediador de credito"],
        "Link do Banco de Portugal": values["Link do Banco de Portugal"],
        "Financeiras com acordo": values["Financeiras com acordo"],
        "Data ultima visita": values["Data ultima visita"],
        "Grupo": values["Grupo"],
        "Marcas representadas": values["Marcas representadas"],
        "Tipo de empresa": values["Tipo de empresa"],
        "Quer CT": values["Quer CT"],
        "Quer ser parceiro Credibom": values["Quer ser parceiro Credibom"],
        "Autobiz": values["Autobiz"],
      };

      await upsertCompanyAdditionalExcelData([newCompanyData], userId);
      showSuccess("Nova empresa adicional criada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar nova empresa adicional:", error);
      showError(error.message || "Falha ao criar a nova empresa adicional.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    // Removed excel_company_id from direct input
    { name: "Nome Comercial", label: "Nome Comercial", type: "text" },
    { name: "Email da empresa", label: "Email da empresa", type: "email", required: true }, // Made email required for lookup
    { name: "STAND_POSTAL_CODE", label: "Código Postal do Stand", type: "text" },
    { name: "Distrito", label: "Distrito", type: "text" },
    { name: "Cidade", label: "Cidade", type: "text" },
    { name: "Morada", label: "Morada", type: "text" },
    { name: "AM_OLD", label: "AM Antigo", type: "text" },
    { name: "AM", label: "AM Atual", type: "text" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Display generated Excel Company ID */}
          <FormItem className="md:col-span-2">
            <FormLabel>ID Excel da Empresa</FormLabel>
            <div className="flex items-center">
              <Input
                value={generatedExcelCompanyId || 'A gerar...'}
                readOnly
                className={isProvisional ? "border-orange-500 text-orange-500" : ""}
              />
              {isLookingUpEmail && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {isProvisional && (
              <p className="text-sm text-orange-500 mt-1">
                ID provisório gerado. O email não foi encontrado no CRM principal.
              </p>
            )}
            {!generatedExcelCompanyId && !isLookingUpEmail && (
              <p className="text-sm text-red-500 mt-1">
                Por favor, insira um email válido para gerar o ID da empresa.
              </p>
            )}
          </FormItem>

          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof FormData}
              render={({ field: formField }) => (
                <FormItem>
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
          <Button type="submit" disabled={isSubmitting || !userId || !generatedExcelCompanyId}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Criar...
              </>
            ) : (
              "Criar Empresa Adicional"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyAdditionalCreateForm;