"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/context/SessionContext';
import { parseGenericExcel } from '@/lib/general-excel-parser';
import { upsertCompanyAdditionalExcelData } from '@/integrations/supabase/utils';
import { CompanyAdditionalExcelData } from '@/types/crm';
import { Progress } from '@/components/ui/progress';

interface AdditionalExcelUploadCardProps {
  onUploadSuccess: () => void;
}

const AdditionalExcelUploadCard: React.FC<AdditionalExcelUploadCardProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useSession();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setUploadProgress(0);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Nenhum ficheiro selecionado.", {
        description: "Por favor, selecione um ficheiro Excel para carregar.",
      });
      return;
    }

    if (!user?.id) {
      toast.error("Erro de autenticação.", {
        description: "Utilizador não autenticado. Por favor, faça login novamente.",
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(20);
      const parsedData = await parseGenericExcel(file);
      setUploadProgress(60);

      if (parsedData.length === 0) {
        toast.warning("Nenhum dado encontrado no ficheiro Excel.", {
          description: "Verifique se o ficheiro está formatado corretamente.",
        });
        setIsLoading(false);
        return;
      }

      const dataToUpsert: CompanyAdditionalExcelData[] = parsedData.map((row: Record<string, any>) => {
        const excelCompanyId = String(row['excel_company_id (OBRIGATÓRIO)'] || row['excel_company_id'] || '');
        if (!excelCompanyId) {
          throw new Error(`Linha inválida: 'excel_company_id' em falta. Linha: ${JSON.stringify(row)}`);
        }

        return {
          user_id: user.id,
          excel_company_id: excelCompanyId,
          "Nome Comercial": String(row['Nome Comercial'] || '') || null,
          "Email da empresa": String(row['Email da empresa'] || '') || null,
          "STAND_POSTAL_CODE": String(row['STAND_POSTAL_CODE'] || '') || null,
          "Distrito": String(row['Distrito'] || '') || null,
          "Cidade": String(row['Cidade'] || '') || null,
          "Morada": String(row['Morada'] || '') || null,
          "AM_OLD": String(row['AM_OLD'] || '') || null,
          "AM": String(row['AM'] || '') || null,
          "Stock STV": row['Stock STV'] !== undefined && row['Stock STV'] !== null ? Number(row['Stock STV']) : null,
          "API": String(row['API'] || '') || null,
          "Site": String(row['Site'] || '') || null,
          "Stock na empresa": row['Stock na empresa'] !== undefined && row['Stock na empresa'] !== null ? Number(row['Stock na empresa']) : null,
          "Logotipo": String(row['Logotipo'] || '') || null,
          "Classificação": String(row['Classificação'] || '') || null,
          "Percentagem de Importados": row['Percentagem de Importados'] !== undefined && row['Percentagem de Importados'] !== null ? Number(row['Percentagem de Importados']) : null,
          "Onde compra as viaturas": String(row['Onde compra as viaturas'] || '') || null,
          "Concorrencia": String(row['Concorrencia'] || '') || null,
          "Investimento redes sociais": row['Investimento redes sociais'] !== undefined && row['Investimento redes sociais'] !== null ? Number(row['Investimento redes sociais']) : null,
          "Investimento em portais": row['Investimento em portais'] !== undefined && row['Investimento em portais'] !== null ? Number(row['Investimento em portais']) : null,
          "Mercado b2b": row['Mercado b2b (1 para Sim, 0 para Não)'] === '1' || row['Mercado b2b'] === true,
          "Utiliza CRM": row['Utiliza CRM (1 para Sim, 0 para Não)'] === '1' || row['Utiliza CRM'] === true,
          "Qual o CRM": String(row['Qual o CRM'] || '') || null,
          "Plano Indicado": String(row['Plano Indicado'] || '') || null,
          "Mediador de credito": row['Mediador de credito (1 para Sim, 0 para Não)'] === '1' || row['Mediador de credito'] === true,
          "Link do Banco de Portugal": String(row['Link do Banco de Portugal'] || '') || null,
          "Financeiras com acordo": String(row['Financeiras com acordo'] || '') || null,
          "Data ultima visita": String(row['Data ultima visita (YYYY-MM-DD)'] || '') || null,
          "Grupo": String(row['Grupo'] || '') || null,
          "Marcas representadas": String(row['Marcas representadas'] || '') || null,
          "Tipo de empresa": String(row['Tipo de empresa'] || '') || null,
          "Quer CT": row['Quer CT (1 para Sim, 0 para Não)'] === '1' || row['Quer CT'] === true,
          "Quer ser parceiro Credibom": row['Quer ser parceiro Credibom (1 para Sim, 0 para Não)'] === '1' || row['Quer ser parceiro Credibom'] === true,
          "Autobiz": String(row['Autobiz'] || '') || null,
        };
      });

      await upsertCompanyAdditionalExcelData(dataToUpsert, user.id);
      setUploadProgress(100);

      toast.success("Dados adicionais carregados com sucesso!", {
        description: `${dataToUpsert.length} registos de dados adicionais foram atualizados.`,
      });
      onUploadSuccess();
    } catch (error: any) {
      console.error("Error during additional upload:", error);
      toast.error("Erro durante o carregamento do ficheiro adicional.", {
        description: error.message || "Ocorreu um erro inesperado ao processar o ficheiro.",
      });
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Carregar Ficheiro Excel Adicional</CardTitle>
        <CardDescription className="text-muted-foreground">
          Carregue um ficheiro Excel com informações adicionais das empresas.
          A coluna "excel_company_id" é obrigatória e deve corresponder a um `company_id` existente na tabela `companies`.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="additional-excel-file">Ficheiro Excel Adicional</Label>
          <Input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
        </div>
        <Button onClick={handleUpload} disabled={!file || isLoading || !user?.id} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A carregar ({uploadProgress}%)
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Carregar Dados Adicionais
            </>
          )}
        </Button>
        {isLoading && (
          <Progress value={uploadProgress} className="w-full mt-2" />
        )}
        {!user?.id && (
          <p className="text-sm text-red-500">Por favor, faça login para carregar dados.</p>
        )}
        <p className="text-sm text-muted-foreground">
          Certifique-se de que o ficheiro Excel/CSV segue o modelo fornecido.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdditionalExcelUploadCard;