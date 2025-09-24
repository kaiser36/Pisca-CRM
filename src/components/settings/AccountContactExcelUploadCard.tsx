"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseGenericExcel } from '@/lib/general-excel-parser';
import { upsertAccountContacts } from '@/integrations/supabase/utils';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { AccountContact } from '@/types/crm';
import { Progress } from '@/components/ui/progress';

const AccountContactExcelUploadCard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
      setUploadProgress(0);
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
    setUploadProgress(0);
    try {
      setUploadProgress(20);
      const parsedData = await parseGenericExcel(selectedFile);
      setUploadProgress(60);
      
      const dataToUpsert: AccountContact[] = parsedData.map((row: Record<string, any>) => {
        const companyExcelId = String(row['ID da Empresa Excel (OBRIGATÓRIO)'] || row['company_excel_id'] || '');
        const contactPersonName = String(row['Nome da Pessoa de Contacto'] || row['contact_person_name'] || '');
        const contactDate = String(row['Data do Contacto (YYYY-MM-DD HH:MM:SS)'] || row['contact_date'] || '');

        if (!companyExcelId) {
          throw new Error(`Linha inválida: 'ID da Empresa Excel' em falta. Linha: ${JSON.stringify(row)}`);
        }
        if (!contactPersonName) {
          throw new Error(`Linha inválida: 'Nome da Pessoa de Contacto' em falta. Linha: ${JSON.stringify(row)}`);
        }
        if (!contactDate) {
          throw new Error(`Linha inválida: 'Data do Contacto' em falta. Linha: ${JSON.stringify(row)}`);
        }

        return {
          user_id: userId,
          account_am: String(row['AM da Conta'] || '') || null,
          contact_type: String(row['Tipo de Contacto'] || '') || null,
          report_text: String(row['Texto do Relatório'] || '') || null,
          contact_date: contactDate,
          contact_method: String(row['Meio de Contacto'] || '') || null,
          commercial_name: String(row['Nome Comercial'] || '') || null,
          company_name: String(row['Nome da Empresa'] || '') || null,
          crm_id: String(row['ID CRM'] || '') || null,
          company_excel_id: companyExcelId,
          stand_name: String(row['Nome do Stand'] || '') || null,
          subject: String(row['Assunto'] || '') || null,
          contact_person_name: contactPersonName,
          company_group: String(row['Grupo da Empresa'] || '') || null,
          account_armatis: String(row['Account Armatis'] || '') || null,
          quarter: String(row['Trimestre'] || '') || null,
          is_credibom_partner: row['É Parceiro Credibom? (1 para Sim, 0 para Não)'] === '1' || row['is_credibom_partner'] === true,
          send_email: row['Enviar Email? (1 para Sim, 0 para Não)'] === '1' || row['send_email'] === true,
          email_type: String(row['Tipo de Email'] || '') || null,
          email_subject: String(row['Assunto do Email'] || '') || null,
          email_body: String(row['Corpo do Email'] || '') || null,
          attachment_url: String(row['URL do Anexo'] || '') || null,
          sending_email: String(row['Email de Envio'] || '') || null,
        } as AccountContact;
      });

      await upsertAccountContacts(dataToUpsert, userId);
      setUploadProgress(100);

      showSuccess(`Dados de ${dataToUpsert.length} contactos de empresas carregados com sucesso!`);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error during account contact data upload:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel para contactos de empresas.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Carregar Dados de Contactos de Empresas</CardTitle>
        <CardDescription className="text-muted-foreground">
          Carregue um ficheiro Excel com informações sobre os contactos das empresas.
          As colunas 'ID da Empresa Excel', 'Nome da Pessoa de Contacto' e 'Data do Contacto' são obrigatórias.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading || !userId} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A carregar ({uploadProgress}%)
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Carregar Ficheiro de Contactos
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
          Certifique-se de que o ficheiro Excel/CSV segue o modelo fornecido.
        </p>
      </CardContent>
    </Card>
  );
};

export default AccountContactExcelUploadCard;