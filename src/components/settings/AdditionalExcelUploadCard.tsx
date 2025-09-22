"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseGenericExcel } from '@/lib/general-excel-parser';
import { upsertCompanyAdditionalExcelData } from '@/integrations/supabase/utils'; // Updated import
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { CompanyAdditionalExcelData } from '@/types/crm';

const AdditionalExcelUploadCard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError("Por favor, selecione um ficheiro Excel para carregar.");
      return;
    }
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para carregar dados.");
      return;
    }

    setIsUploading(true);
    try {
      const parsedData = await parseGenericExcel(selectedFile);
      
      // Map parsed data to CompanyAdditionalExcelData interface
      const dataToUpsert: CompanyAdditionalExcelData[] = parsedData.map((row: Record<string, any>) => {
        const excelCompanyId = String(row['excel_company_id'] || row['Company_id'] || '');
        console.log(`Processing excel_company_id: ${excelCompanyId}`); // Log the ID being processed
        return {
          user_id: userId,
          excel_company_id: excelCompanyId, // Adjust key names as per your Excel structure
          "Nome Comercial": row['Nome Comercial'] || row['Commercial_Name'] || null,
          "Email da empresa": row['Email da empresa'] || row['Company_Email'] || null,
          "STAND_POSTAL_CODE": row['STAND_POSTAL_CODE'] || row['Company_Postal_Code'] || null,
          "Distrito": row['Distrito'] || row['District'] || null,
          "Cidade": row['Cidade'] || row['Company_City'] || null,
          "Morada": row['Morada'] || row['Company_Address'] || null,
          "AM_OLD": row['AM_OLD'] || row['AM_Old'] || null,
          "AM": row['AM'] || row['AM_Current'] || null,
          "Stock STV": row['Stock STV'] !== undefined && row['Stock STV'] !== null ? Number(row['Stock STV']) : null,
          "API": row['API'] || row['Company_API_Info'] || null,
          "Site": row['Site'] || row['Website'] || null,
          "Stock na empresa": row['Stock na empresa'] !== undefined && row['Stock na empresa'] !== null ? Number(row['Stock na empresa']) : null,
          "Logotipo": row['Logotipo'] || row['Logo_URL'] || null,
          "Classificação": row['Classificação'] || row['Classification'] || null,
          "Percentagem de Importados": row['Percentagem de Importados'] !== undefined && row['Percentagem de Importados'] !== null ? Number(row['Percentagem de Importados']) : null,
          "Onde compra as viaturas": row['Onde compra as viaturas'] || row['Vehicle_Source'] || null,
          "Concorrencia": row['Concorrencia'] || row['Competition'] || null,
          "Investimento redes sociais": row['Investimento redes sociais'] !== undefined && row['Investimento redes sociais'] !== null ? Number(row['Investimento redes sociais']) : null,
          "Investimento em portais": row['Investimento em portais'] !== undefined && row['Investimento em portais'] !== null ? Number(row['Investimento em portais']) : null,
          "Mercado b2b": row['Mercado b2b'] === '1' || row['Mercado b2b'] === true,
          "Utiliza CRM": row['Utiliza CRM'] === '1' || row['Uses_CRM'] === true,
          "Qual o CRM": row['Qual o CRM'] || row['CRM_Software'] || null,
          "Plano Indicado": row['Plano Indicado'] || row['Recommended_Plan'] || null,
          "Mediador de credito": row['Mediador de credito'] === '1' || row['Credit_Mediator'] === true,
          "Link do Banco de Portugal": row['Link do Banco de Portugal'] || row['Bank_Of_Portugal_Link'] || null,
          "Financeiras com acordo": row['Financeiras com acordo'] || row['Financing_Agreements'] || null,
          "Data ultima visita": row['Data ultima visita'] || row['Last_Visit_Date'] || null,
          "Grupo": row['Grupo'] || row['Company_Group'] || null,
          "Marcas representadas": row['Marcas representadas'] || row['Represented_Brands'] || null,
          "Tipo de empresa": row['Tipo de empresa'] || row['Company_Type'] || null,
          "Quer CT": row['Quer CT'] === '1' || row['Wants_CT'] === true,
          "Quer ser parceiro Credibom": row['Quer ser parceiro Credibom'] === '1' || row['Wants_CRB_Partner'] === true,
          "Autobiz": row['Autobiz'] || row['Autobiz_Info'] || null
        } as CompanyAdditionalExcelData;
      });

      await upsertCompanyAdditionalExcelData(dataToUpsert, userId);
      showSuccess(`Dados adicionais de ${dataToUpsert.length} empresas carregados com sucesso!`);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel para dados adicionais.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Carregar Dados Adicionais de Empresas</CardTitle>
        <CardDescription>
          Carregue um ficheiro Excel com informações adicionais para as empresas.
          A coluna 'excel_company_id' (ou 'Company_id') é usada para identificar a empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading || !userId} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A carregar...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Carregar Ficheiro Adicional
            </>
          )}
        </Button>
        {!userId && (
          <p className="text-sm text-red-500">Por favor, faça login para carregar dados.</p>
        )}
        <p className="text-sm text-muted-foreground">
          Certifique-se de que o ficheiro Excel contém uma coluna `excel_company_id` ou `Company_id` para mapeamento.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdditionalExcelUploadCard;