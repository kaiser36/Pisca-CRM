"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdditionalExcelUploadCardProps {
  onUploadSuccess: () => void;
}

const AdditionalExcelUploadCard: React.FC<AdditionalExcelUploadCardProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
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

    setIsLoading(true);
    // Simulate an upload process
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    try {
      // In a real scenario, you would parse and upload the additional data here
      console.log("Simulating upload of additional Excel data:", file.name);
      toast.success("Dados adicionais carregados com sucesso!", {
        description: `Ficheiro '${file.name}' processado.`,
      });
      onUploadSuccess();
    } catch (error: any) {
      console.error("Error during additional upload:", error);
      toast.error("Erro durante o carregamento do ficheiro adicional.", {
        description: error.message || "Ocorreu um erro inesperado ao processar o ficheiro.",
      });
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Carregar Ficheiro Excel Adicional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="additional-excel-file">Ficheiro Excel Adicional</Label>
          <Input id="additional-excel-file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        </div>
        <Button onClick={handleUpload} disabled={!file || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A carregar...
            </>
          ) : (
            "Carregar Dados Adicionais"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdditionalExcelUploadCard;