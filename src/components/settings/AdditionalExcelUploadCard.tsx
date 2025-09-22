"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { parseGenericExcel } from '@/lib/general-excel-parser';
import { upsertCompanyAdditionalExcelData } from '@/integrations/supabase/utils';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { CompanyAdditionalExcelData } from '@/types/crm';

const AdditionalExcelUploadCard: React.FC = () => {
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
      const parsedData = await parseGenericExcel(selectedFile);
      
      // Map parsed data to CompanyAdditionalExcelData interface
      const dataToUpsert: CompanyAdditionalExcelData[] = parsedData.map(row => ({
        user_id: userId,
        excel_company_id: String(row['excel_company_id'] || row['Company_id'] || ''), // Adjust key names as per your Excel structure
        excel_commercial_name: row['excel_commercial_name'] || row['Commercial_Name'] || null,
        excel_company_email: row['excel_company_email'] || row['Company_Email'] || null,
        excel_stand_postal_code: row['excel_stand_postal_code'] || row['Company_Postal_Code'] || null,
        excel_district: row['excel_district'] || row['District'] || null,
        excel_city: row['excel_city'] || row['Company_City'] || null,
        excel_address: row['excel_address'] || row['Company_Address'] || null,
        excel_am_old: row['excel_am_old'] || row['AM_Old'] || null,
        excel_am_current: row['excel_am_current'] || row['AM_Current'] || null,
        excel_stock_stv: row['excel_stock_stv'] ? Number(row['excel_stock_stv']) : null,
        excel_api_value: row['excel_api_value'] || row['Company_API_Info'] || null,
        excel_website: row['excel_website'] || row['Website'] || null,
        excel_company_stock: row['excel_company_stock'] ? Number(row['excel_company_stock']) : null,
        excel_logo_url: row['excel_logo_url'] || row['Logo_URL'] || null,
        excel_classification: row['excel_classification'] || row['Classification'] || null,
        excel_imported_percentage: row['excel_imported_percentage'] ? Number(row['excel_imported_percentage']) : null,
        excel_vehicle_source: row['excel_vehicle_source'] || row['Vehicle_Source'] || null,
        excel_competition: row['excel_competition'] || row['Competition'] || null,
        excel_social_media_investment: row['excel_social_media_investment'] ? Number(row['excel_social_media_investment']) : null,
        excel_portal_investment: row['excel_portal_investment'] ? Number(row['excel_portal_investment']) : null,
        excel_b2b_market: row['excel_b2b_market'] === '1' || row['B2B_Market'] === true,
        excel_uses_crm: row['excel_uses_crm'] === '1' || row['Uses_CRM'] === true,
        excel_crm_software: row['excel_crm_software'] || row['CRM_Software'] || null,
        excel_recommended_plan: row['excel_recommended_plan'] || row['Recommended_Plan'] || null,
        excel_credit_mediator: row['excel_credit_mediator'] === '1' || row['Credit_Mediator'] === true,
        excel_bank_of_portugal_link: row['excel_bank_of_portugal_link'] || row['Bank_Of_Portugal_Link'] || null,
        excel_financing_agreements: row['excel_financing_agreements'] || row['Financing_Agreements'] || null,
        excel_last_visit_date: row['excel_last_visit_date'] || row['Last_Visit_Date'] || null,
        excel_company_group: row['excel_company_group'] || row['Company_Group'] || null,
        excel_represented_brands: row['excel_represented_brands'] || row['Represented_Brands'] || null,
        excel_company_type: row['excel_company_type'] || row['Company_Type'] || null,
        excel_wants_ct: row['excel_wants_ct'] === '1' || row['Wants_CT'] === true,
        excel_wants_crb_partner: row['excel_wants_crb_partner'] === '1' || row['Wants_CRB_Partner'] === true,
        excel_autobiz_info: row['excel_autobiz_info'] || row['Autobiz_Info'] || null,
      }));

      await upsertCompanyAdditionalExcelData(dataToUpsert, userId);
      showSuccess(`Dados adicionais de ${dataToUpsert.length} empresas carregados com sucesso!`);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Erro ao carregar ou analisar o ficheiro Excel:", error);
      showError(error.message || "Falha ao carregar ou analisar o ficheiro Excel para dados adicionais.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Carregar Dados Adicionais de Empresas</CardTitle>
        <CardDescription>
          Carregue um ficheiro Excel com informações adicionais para as empresas.
          A coluna 'excel_company_id' (ou 'Company_id') é usada para identificar a empresa.
        </CardDescription>
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
              Carregar Ficheiro Adicional
            </>
          )}
        </Button>
        {!userId && (
          <p className="text-sm text-red-500">Por favor, faça login para carregar dados.</p>
        )}
        <p className="text-sm text-muted-foreground">
          Certifique-se de que o ficheiro Excel contém uma coluna `excel_company_id` ou `Company_id` para mapeamento.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdditionalExcelUploadCard;