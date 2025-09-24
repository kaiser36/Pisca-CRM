"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseGenericExcel } from '@/lib/general-excel-parser';
import { upsertEasyvistas } from '@/integrations/supabase/utils';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Easyvista } from '@/types/crm';
import { Progress } from '@/components/ui/progress';

const EasyvistaExcelUploadCard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
      setUploadProgress(0);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError("Por favor, selecione um ficheiro Excel/CSV para carregar.");
      return;
    }
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para carregar dados.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      setUploadProgress(20);
      const parsedData = await parseGenericExcel(selectedFile);
      setUploadProgress(60);
      
      const dataToUpsert: Easyvista[] = parsedData.map((row: Record<string, any>) => {
        const companyExcelId = String(row['company_excel_id'] || '');
        const evId = String(row['EV_ID'] || '');

        if (!companyExcelId || !evId) {
          throw new Error(`Linha inválida: 'company_excel_id' ou 'EV_ID' em falta. Linha: ${JSON.stringify(row)}`);
        }

        return {
          user_id: userId,
          company_excel_id: companyExcelId,
          "Nome comercial": String(row['Nome comercial'] || '') || null,
          "EV_ID": evId,
          "Data Criação": String(row['Data Criação (YYYY-MM-DD HH:MM:SS)'] || '') || null,
          "Status": String(row['Status'] || '') || null,
          "Account": String(row['Account'] || '') || null,
          "Titulo": String(row['Titulo'] || '') || null,
          "Descrição": String(row['Descrição'] || '') || null,
          "Anexos": row['Anexos (URLs separados por \';\')'] ? String(row['Anexos (URLs separados por \';\')']).split(';').map((url: string) => url.trim()).filter(Boolean) : null,
          "Ultima actualização": String(row['Ultima actualização (YYYY-MM-DD HH:MM:SS)'] || '') || null,
          "Tipo de report": String(row['Tipo de report'] || '') || null,
          "PV": row['PV (1 para Sim, 0 para Não)'] === '1' || row['PV'] === true,
          "Tipo EVS": String(row['Tipo EVS'] || '') || null,
          "Urgência": String(row['Urgência'] || '') || null,
          "Email Pisca": String(row['Email Pisca'] || '') || null,
          "Pass Pisca": String(row['Pass Pisca'] || '') || null,
          "Client ID": String(row['Client ID'] || '') || null,
          "Client Secret": String(row['Client Secret'] || '') || null,
          "Integração": String(row['Integração'] || '') || null,
          "NIF da empresa": String(row['NIF da empresa'] || '') || null,
          "Campanha": String(row['Campanha'] || '') || null,
          "Duração do acordo": String(row['Duração do acordo'] || '') || null,
          "Plano do acordo": String(row['Plano do acordo'] || '') || null,
          "Valor sem iva": row['Valor sem iva'] !== undefined && row['Valor sem iva'] !== null ? Number(row['Valor sem iva']) : null,
          "ID_Proposta": String(row['ID_Proposta'] || '') || null,
          "Account Armatis": String(row['Account Armatis'] || '') || null,
        } as Easyvista;
      });

      await upsertEasyvistas(dataToUpsert, userId);
      setUploadProgress(100);

      showSuccess(`Dados de ${dataToUpsert.length} Easyvistas carregados com sucesso!`);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error during Easyvista data upload:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel/CSV para Easyvistas.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Carregar Dados de Easyvistas</CardTitle>
        <CardDescription className="text-muted-foreground">
          Carregue um ficheiro Excel/CSV com informações sobre os registos Easyvista.
          As colunas 'company_excel_id' e 'EV_ID' são obrigatórias.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading || !userId} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A carregar ({uploadProgress}%)
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Carregar Ficheiro de Easyvistas
            </>
          )}
        </Button>
        {isUploading && (
          <Progress value={uploadProgress} className="w-full mt-2" />
        )}
        {!userId && (
          <p className="text-sm text-red-500">Por favor, faça login para carregar dados.</p>
        )}
        <p className="text-sm text-muted-foreground">
          Certifique-se de que o ficheiro Excel/CSV segue o modelo fornecido.
        </p>
      </CardContent>
    </Card>
  );
};

export default EasyvistaExcelUploadCard;