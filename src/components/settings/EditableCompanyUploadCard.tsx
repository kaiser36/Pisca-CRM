"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseEditableCompanyExcel } from '@/lib/excel-parser';
import { useCrmData } from '@/context/CrmDataContext';
import { showError, showSuccess } from '@/utils/toast';

const EditableCompanyUploadCard: React.FC = () => {
  const { updateCompaniesFromExcel } = useCrmData();
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
      const editableData = await parseEditableCompanyExcel(arrayBuffer);
      await updateCompaniesFromExcel(editableData);
      setSelectedFile(null);
      showSuccess("Campos editáveis das empresas atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel de campos editáveis:", error);
      showError("Falha ao carregar ou analisar o ficheiro Excel. Verifique o formato e se o 'Company_ID' existe.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Campos Editáveis das Empresas</CardTitle>
        <CardDescription>
          Atualize campos específicos das empresas existentes carregando um ficheiro Excel.
          O ficheiro deve conter a coluna 'Company_ID' para identificação.
        </CardDescription>
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
              Carregar Ficheiro de Edição
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          Apenas as colunas presentes no ficheiro serão atualizadas para as empresas correspondentes.
        </p>
      </CardContent>
    </Card>
  );
};

export default EditableCompanyUploadCard;