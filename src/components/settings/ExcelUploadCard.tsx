"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { parseStandsExcel } from '@/lib/excel-parser';
import { toast } from 'sonner';
import { upsertCompanies } from '@/integrations/supabase/services/companyService';
import { upsertStands, deleteStands } from '@/integrations/supabase/services/standService';
import { Company } from '@/types/crm';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/context/SessionContext'; // Use useSession

interface ExcelUploadCardProps {
  onUploadSuccess: () => void;
}

const ExcelUploadCard: React.FC<ExcelUploadCardProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSession(); // Use useSession

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

    if (!user?.id) {
      toast.error("Erro de autenticação.", {
        description: "Utilizador não autenticado. Por favor, faça login novamente.",
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const companiesWithStands: Company[] = await parseStandsExcel(arrayBuffer);

        if (companiesWithStands.length === 0) {
          toast.warning("Nenhum dado de empresa ou stand encontrado no ficheiro Excel.", {
            description: "Verifique se o ficheiro está formatado corretamente.",
          });
          setIsLoading(false);
          return;
        }

        await deleteStands(user.id);

        const companyDbIdMap = await upsertCompanies(companiesWithStands, user.id);
        
        const allStandsToUpsert = companiesWithStands.flatMap(company => 
          company.stands.map(stand => ({
            ...stand,
            Company_id: company.Company_id
          }))
        );
        
        await upsertStands(allStandsToUpsert, companyDbIdMap);

        toast.success("Dados do CRM carregados com sucesso!", {
          description: `${companiesWithStands.length} empresas e os seus stands foram atualizados.`,
        });
        onUploadSuccess();
      } catch (error: any) {
        console.error("Error during upload:", error);
        toast.error("Erro durante o carregamento do ficheiro.", {
          description: error.message || "Ocorreu um erro inesperado ao processar o ficheiro.",
        });
      } finally {
        setIsLoading(false);
        setFile(null);
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast.error("Erro ao ler o ficheiro.", {
        description: "Não foi possível ler o conteúdo do ficheiro.",
      });
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Carregar Ficheiro CRM (Stands)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="excel-file">Ficheiro Excel</Label>
          <Input id="excel-file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        </div>
        <Button onClick={handleUpload} disabled={!file || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A carregar...
            </>
          ) : (
            "Carregar Dados CRM"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExcelUploadCard;