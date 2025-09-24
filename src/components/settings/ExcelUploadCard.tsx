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
import { Progress } from '@/components/ui/progress'; // Import the Progress component

const ExcelUploadCard: React.FC = () => {
  const { loadInitialData } = useCrmData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // New state for progress
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
      setUploadProgress(0); // Reset progress on new file selection
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
    setUploadProgress(0); // Start progress from 0
    try {
      // Step 1: Parse Excel file (approx 20% of total process)
      setUploadProgress(10);
      const arrayBuffer = await selectedFile.arrayBuffer();
      const newCompanies = await parseStandsExcel(arrayBuffer);
      setUploadProgress(30);

      // Step 2: Upsert Companies (approx 40% of total process)
      const companyDbIdMap = await upsertCompanies(newCompanies, userId);
      setUploadProgress(70);
      
      // Step 3: Upsert Stands (approx 20% of total process)
      const allStands = newCompanies.flatMap(company => company.stands);
      await upsertStands(allStands, companyDbIdMap);
      setUploadProgress(90);

      // Step 4: Load initial data to refresh UI (approx 10% of total process)
      await loadInitialData();
      setUploadProgress(100); // Mark as complete

      showSuccess("Dados CRM carregados e guardados com sucesso!");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error during upload:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel. Verifique o formato.");
      setUploadProgress(0); // Reset or indicate error state
    } finally {
      setIsUploading(false);
    }
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
              A carregar ({uploadProgress}%)
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Carregar Ficheiro
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
          Certifique-se de que o ficheiro Excel tem as mesmas colunas e nomes que o modelo original.
        </p>
      </CardContent>
    </Card>
  );
};

export default ExcelUploadCard;