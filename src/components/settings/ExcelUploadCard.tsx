"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseStandsExcel } from '@/lib/excel-parser';
import { useCrmData } from '@/context/CrmDataContext';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { upsertCompanies, upsertStands } from '@/integrations/supabase/utils'; // Import new utility functions

const ExcelUploadCard: React.FC = () => {
  const { updateCrmData } = useCrmData();
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
    if (!selectedFile) {
      showError("Por favor, selecione um ficheiro Excel para carregar.");
      return;
    }
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para carregar dados.");
      return;
    }

    setIsUploading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const newCompanies = await parseStandsExcel(arrayBuffer);
      
      // Save companies and stands to Supabase
      const companyDbIdMap = await upsertCompanies(newCompanies, userId);
      
      // Flatten all stands from the newCompanies array
      const allStands = newCompanies.flatMap(company => company.stands);
      await upsertStands(allStands, companyDbIdMap);

      updateCrmData(newCompanies); // Update frontend context
      setSelectedFile(null);
      showSuccess("Dados CRM carregados e guardados no banco de dados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel:", error);
      showError("Falha ao carregar ou analisar o ficheiro Excel. Verifique o formato e a sua autenticação.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Carregar Dados CRM</CardTitle>
        <CardDescription>Atualize as informações das empresas carregando um novo ficheiro Excel.</CardDescription>
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
          <p className="text-sm text-red-500">Faça login para carregar e guardar os dados no banco de dados.</p>
        )}
        <p className="text-sm text-muted-foreground">
          Certifique-se de que o ficheiro Excel tem as mesmas colunas e nomes que o modelo original.
        </p>
      </CardContent>
    </Card>
  );
};

export default ExcelUploadCard;