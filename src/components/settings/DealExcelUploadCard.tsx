"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseGenericExcel } from '@/lib/general-excel-parser';
import { upsertDeals } from '@/integrations/supabase/utils';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Negocio } from '@/types/crm';
import { Progress } from '@/components/ui/progress';

const DealExcelUploadCard: React.FC = () => {
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
      
      const dataToUpsert: Negocio[] = parsedData.map((row: Record<string, any>) => {
        const companyExcelId = String(row['ID da Empresa Excel (OBRIGATÓRIO)'] || row['company_excel_id'] || '');
        const dealName = String(row['Nome do Negócio (OBRIGATÓRIO)'] || row['deal_name'] || '');

        if (!companyExcelId || !dealName) {
          throw new Error(`Linha inválida: 'ID da Empresa Excel' ou 'Nome do Negócio' em falta. Linha: ${JSON.stringify(row)}`);
        }

        return {
          user_id: userId,
          company_excel_id: companyExcelId,
          deal_name: dealName,
          deal_status: String(row['Status do Negócio'] || '') || null,
          currency: String(row['Moeda'] || '') || null,
          expected_close_date: String(row['Data de Fecho Esperada (YYYY-MM-DD)'] || '') || null,
          stage: String(row['Etapa'] || '') || null,
          priority: String(row['Prioridade'] || '') || null,
          notes: String(row['Notas'] || '') || null,
          discount_type: String(row['Tipo de Desconto Geral'] || 'none') as 'none' | 'percentage' | 'amount',
          discount_value: row['Valor do Desconto Geral'] !== undefined && row['Valor do Desconto Geral'] !== null ? Number(row['Valor do Desconto Geral']) : null,
          // deal_value and final_deal_value are calculated in the UI/DB, not directly uploaded
        } as Negocio;
      });

      await upsertDeals(dataToUpsert, userId);
      setUploadProgress(100);

      showSuccess(`Dados de ${dataToUpsert.length} Negócios carregados com sucesso!`);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error during Deal data upload:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel/CSV para Negócios.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Carregar Dados de Negócios</CardTitle>
        <CardDescription className="text-muted-foreground">
          Carregue um ficheiro Excel/CSV com informações sobre os negócios.
          As colunas 'ID da Empresa Excel' e 'Nome do Negócio' são obrigatórias.
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
              Carregar Ficheiro de Negócios
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

export default DealExcelUploadCard;