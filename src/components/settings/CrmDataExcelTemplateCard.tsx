"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateCrmDataCsvTemplate } from '@/lib/crm-data-csv-generator';

const CrmDataExcelTemplateCard: React.FC = () => {
  const handleDownloadTemplate = () => {
    const csvContent = generateCrmDataCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'modelo_dados_crm.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Modelo de Dados CRM</CardTitle>
        <CardDescription>
          Descarregue um modelo CSV para carregar os dados principais das empresas e stands.
          Cada linha deve conter os dados de uma empresa e um dos seus stands.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDownloadTemplate} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Descarregar Modelo CSV CRM
        </Button>
        <p className="text-sm text-muted-foreground">
          Use este modelo para preparar os seus dados antes de os carregar.
        </p>
      </CardContent>
    </Card>
  );
};

export default CrmDataExcelTemplateCard;