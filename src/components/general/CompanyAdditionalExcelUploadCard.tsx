"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileText, Save } from 'lucide-react';
import { parseCompanyAdditionalExcel } from '@/lib/excel-parser';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { upsertCompanyAdditionalExcelData } from '@/integrations/supabase/utils';
import { CompanyAdditionalExcelData } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CompanyAdditionalExcelUploadCard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [excelData, setExcelData] = useState<CompanyAdditionalExcelData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
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
      setExcelData([]);
      setHeaders([]);
      setRowCount(0);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadAndDisplay = async () => {
    if (!selectedFile) {
      showError("Por favor, selecione um ficheiro Excel para carregar.");
      return;
    }
    if (!userId) {
      showError("Por favor, faça login para carregar e visualizar dados.");
      return;
    }

    setIsProcessing(true);
    try {
      const data = await parseCompanyAdditionalExcel(selectedFile, userId);
      if (data.length > 0) {
        // Extract headers from the first row, excluding 'id', 'user_id', 'created_at'
        const firstRowKeys = Object.keys(data[0]).filter(key => !['id', 'user_id', 'created_at'].includes(key));
        setHeaders(firstRowKeys);
        setExcelData(data);
        setRowCount(data.length);
        showSuccess(`Ficheiro Excel de detalhes de empresa carregado e exibido com sucesso! ${data.length} linhas encontradas.`);
      } else {
        showError("O ficheiro Excel está vazio ou não contém dados válidos.");
        setHeaders([]);
        setExcelData([]);
        setRowCount(0);
      }
    } catch (error: any) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel.");
      setRowCount(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar dados.");
      return;
    }
    if (excelData.length === 0) {
      showError("Não há dados do Excel para guardar.");
      return;
    }

    setIsSaving(true);
    try {
      await upsertCompanyAdditionalExcelData(excelData, userId);
      showSuccess("Dados adicionais da empresa guardados com sucesso no banco de dados!");
      // Optionally clear the displayed data or provide feedback
      // setExcelData([]);
      // setHeaders([]);
      // setRowCount(0);
      // setSelectedFile(null);
    } catch (error: any) {
      console.error("Erro ao guardar dados adicionais da empresa no Supabase:", error);
      showError(`Falha ao guardar dados: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Carregar Detalhes Adicionais da Empresa (Excel)</CardTitle>
        <CardDescription>Carregue um ficheiro Excel com detalhes adicionais da empresa para guardar no banco de dados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="flex-1" />
          <Button onClick={handleUploadAndDisplay} disabled={!selectedFile || isProcessing || !userId}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A processar...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Carregar e Ver
              </>
            )}
          </Button>
        </div>

        {rowCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Total de linhas carregadas: <span className="font-semibold">{rowCount}</span>
          </p>
        )}

        {excelData.length > 0 && (
          <>
            <ScrollArea className="h-[400px] w-full border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead key={header}>{header.replace('excel_', '').replace(/_/g, ' ')}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map((header) => (
                        <TableCell key={`${rowIndex}-${header}`}>
                          {String((row as any)[header] || '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <Button
              onClick={handleSaveToDatabase}
              disabled={!userId || isSaving || excelData.length === 0}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar no Banco de Dados
                </>
              )}
            </Button>
            {!userId && (
              <p className="text-sm text-red-500">Faça login para guardar os dados no banco de dados.</p>
            )}
          </>
        )}

        {excelData.length === 0 && selectedFile && !isProcessing && (
          <div className="flex items-center justify-center h-40 text-muted-foreground border rounded-md">
            <FileText className="mr-2 h-5 w-5" />
            <span>Nenhum dado para exibir. Carregue um ficheiro.</span>
          </div>
        )}
        {!userId && !selectedFile && (
          <div className="flex items-center justify-center h-40 text-muted-foreground border rounded-md">
            <span>Por favor, faça login para carregar e guardar dados.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyAdditionalExcelUploadCard;