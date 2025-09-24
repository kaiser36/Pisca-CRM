"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseGenericExcel } from '@/lib/general-excel-parser';
import { upsertEmployees } from '@/integrations/supabase/utils';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/crm';
import { Progress } from '@/components/ui/progress';

const EmployeeExcelUploadCard: React.FC = () => {
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
      showError("Por favor, selecione um ficheiro Excel para carregar.");
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
      
      const dataToUpsert: Employee[] = parsedData.map((row: Record<string, any>) => {
        const companyExcelId = String(row['company_excel_id'] || '');
        const nomeColaborador = String(row['Nome do Colaborador'] || '');

        if (!companyExcelId || !nomeColaborador) {
          throw new Error(`Linha inválida: 'company_excel_id' ou 'Nome do Colaborador' em falta. Linha: ${JSON.stringify(row)}`);
        }

        return {
          user_id: userId,
          company_excel_id: companyExcelId,
          nome_colaborador: nomeColaborador,
          telemovel: String(row['Telemóvel'] || '') || null,
          email: String(row['Email'] || '') || null,
          cargo: String(row['Cargo'] || '') || null,
          commercial_name: String(row['Nome Comercial da Empresa'] || '') || null,
          image_url: String(row['URL da Imagem'] || '') || null,
          stand_id: String(row['ID do Stand (Excel)'] || '') || null,
          stand_name: String(row['Nome do Stand'] || '') || null,
        } as Employee;
      });

      await upsertEmployees(dataToUpsert, userId);
      setUploadProgress(100);

      showSuccess(`Dados de ${dataToUpsert.length} colaboradores carregados com sucesso!`);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error during employee data upload:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel para colaboradores.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Carregar Dados de Colaboradores</CardTitle>
        <CardDescription className="text-muted-foreground">
          Carregue um ficheiro Excel com informações sobre os colaboradores.
          As colunas 'company_excel_id' e 'Nome do Colaborador' são obrigatórias.
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
              Carregar Ficheiro de Colaboradores
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

export default EmployeeExcelUploadCard;