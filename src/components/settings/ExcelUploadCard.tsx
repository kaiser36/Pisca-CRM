"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseStandsExcel } from '@/lib/excel-parser';
import { useCrmData } from '@/context/CrmDataContext';
import { showError, showSuccess } from '@/utils/toast';
import { upsertCompanies, upsertStands } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';

const ExcelUploadCard: React.FC = () => {
  const { updateCrmData, loadInitialData } = useCrmData();
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
    console.log("handleUpload started.");
    if (!selectedFile) {
      console.log("No file selected, calling showError.");
      showError("Por favor, selecione um ficheiro Excel para carregar.");
      return;
    }
    if (!userId) {
      console.log("User not authenticated, calling showError.");
      showError("Utilizador não autenticado. Por favor, faça login para carregar dados.");
      return;
    }

    setIsUploading(true); // Set loading state
    console.log("setIsUploading(true) called.");
    try {
      console.log("Starting file parsing.");
      const arrayBuffer = await selectedFile.arrayBuffer();
      const newCompanies = await parseStandsExcel(arrayBuffer);
      console.log("File parsed, starting upsertCompanies.");

      const companyDbIdMap = await upsertCompanies(newCompanies, userId);
      console.log("Companies upserted, starting upsertStands.");
      
      const allStands = newCompanies.flatMap(company => company.stands);
      await upsertStands(allStands, companyDbIdMap);
      console.log("Stands upserted, calling loadInitialData.");

      await loadInitialData(); // Await this call
      console.log("loadInitialData completed.");

      showSuccess("Dados CRM carregados e guardados com sucesso!");
      console.log("showSuccess called.");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error during upload in handleUpload:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel. Verifique o formato.");
      console.log("showError called in catch block.");
    } finally {
      setIsUploading(false); // This should always run
      console.log("setIsUploading(false) called in finally block.");
    }
    console.log("handleUpload finished.");
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Carregar Dados CRM</CardTitle>
        <CardDescription className="text-muted-foreground">Atualize as informações das empresas carregando um novo ficheiro Excel.</CardDescription>
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
              Carregar Ficheiro
            </>
          )}
        </Button>
        {!userId && (
          <p className="text-sm text-red-500">Por favor, faça login para carregar dados.</p>
        )}
        <p className="text-sm text-muted-foreground">
          Certifique-se de que o ficheiro Excel tem as mesmas colunas e nomes que o modelo original.
        </p>
      </CardContent>
    </Card>
  );
};

export default ExcelUploadCard;