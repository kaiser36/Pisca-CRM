"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useCrmData } from '@/context/CrmDataContext';
import { showError } from '@/utils/toast';

const AdditionalInfoUploadCard: React.FC = () => {
  const { updateAdditionalCompanyData } = useCrmData();
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
      await updateAdditionalCompanyData(selectedFile);
      setSelectedFile(null);
    } catch (error) {
      // Error handling is already done in CrmDataContext, just log here if needed
      console.error("Erro no upload de informações adicionais:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Carregar Informações Adicionais</CardTitle>
        <CardDescription>Atualize campos adicionais das empresas carregando um novo ficheiro Excel.</CardDescription>
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
              Carregar Ficheiro
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          O ficheiro Excel deve conter a coluna "Company_ID" para identificar as empresas e as colunas com as novas informações.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoUploadCard;