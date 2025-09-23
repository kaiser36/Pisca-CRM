"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateAccountContactCsvTemplate } from '@/lib/account-contact-csv-generator';

const AccountContactExcelTemplateCard: React.FC = () => {
  const handleDownloadTemplate = () => {
    const csvContent = generateAccountContactCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'modelo_contactos_empresa.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Modelo de Contactos de Empresas</CardTitle>
        <CardDescription className="text-muted-foreground">
          Descarregue um modelo CSV para a tabela de contactos de empresas.
          A coluna "ID da Empresa Excel" é obrigatória e deve corresponder a um `company_id` existente na tabela `companies`.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDownloadTemplate} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Descarregar Modelo CSV
        </Button>
        <p className="text-sm text-muted-foreground">
          Use este modelo para preparar os seus dados antes de os carregar.
        </p>
      </CardContent>
    </Card>
  );
};

export default AccountContactExcelTemplateCard;