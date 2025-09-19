"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseCompanyDetailsExcel } from '@/lib/excel-parser';
import { useCrmData } from '@/context/CrmDataContext';
import { showError, showSuccess } from '@/utils/toast';

const CompanyDetailsUploadCard: React.FC = () => {
  const { updateCompanyDetails } = useCrmData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

    setIsUploading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const newCompanyDetails = await parseCompanyDetailsExcel(arrayBuffer);
      await updateCompanyDetails(newCompanyDetails); // Call the new function in context
      setSelectedFile(null);
      showSuccess("Detalhes da empresa carregados e atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel de detalhes da empresa:", error);
      showError("Falha ao carregar ou analisar o ficheiro Excel de detalhes da empresa. Verifique o formato.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Carregar Detalhes da Empresa</CardTitle>
        <CardDescription>Atualize informações adicionais das empresas carregando um novo ficheiro Excel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A carregar...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Carregar Ficheiro de Detalhes
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          O ficheiro deve conter a coluna "Company_id" para identificar as empresas.
        </p>
      </CardContent>
    </Card>
  );
};

export default CompanyDetailsUploadCard;