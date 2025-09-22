"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Loader2, FileText } from 'lucide-react';
import { parseGenericExcel } from '@/lib/general-excel-parser';
import { showError, showSuccess } from '@/utils/toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const ExcelDisplayCard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [excelData, setExcelData] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number>(0); // New state for row count

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setExcelData([]); // Clear previous data
      setHeaders([]); // Clear previous headers
      setRowCount(0); // Reset row count
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadAndDisplay = async () => {
    if (!selectedFile) {
      showError("Por favor, selecione um ficheiro Excel para carregar.");
      return;
    }

    setIsProcessing(true);
    try {
      const data = await parseGenericExcel(selectedFile);
      if (data.length > 0) {
        setHeaders(Object.keys(data[0]));
        setExcelData(data);
        setRowCount(data.length); // Set row count
        showSuccess(`Ficheiro Excel carregado e exibido com sucesso! ${data.length} linhas encontradas.`);
      } else {
        showError("O ficheiro Excel está vazio ou não contém dados válidos.");
        setHeaders([]);
        setExcelData([]);
        setRowCount(0); // Reset row count
      }
    } catch (error: any) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel.");
      setRowCount(0); // Reset row count on error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Carregar e Visualizar Ficheiro Excel</CardTitle>
        <CardDescription>Carregue um ficheiro Excel para ver os seus dados numa tabela.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="flex-1" />
          <Button onClick={handleUploadAndDisplay} disabled={!selectedFile || isProcessing}>
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

        {rowCount > 0 && ( // Display row count if greater than 0
          <p className="text-sm text-muted-foreground">
            Total de linhas carregadas: <span className="font-semibold">{rowCount}</span>
          </p>
        )}

        {excelData.length > 0 && (
          <ScrollArea className="h-[400px] w-full border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {excelData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header) => (
                      <TableCell key={`${rowIndex}-${header}`}>
                        {String(row[header] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {excelData.length === 0 && selectedFile && !isProcessing && (
          <div className="flex items-center justify-center h-40 text-muted-foreground border rounded-md">
            <FileText className="mr-2 h-5 w-5" />
            <span>Nenhum dado para exibir. Carregue um ficheiro.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelDisplayCard;