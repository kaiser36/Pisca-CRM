"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateEmployeeCsvTemplate } from '@/lib/employee-csv-generator';

const EmployeeExcelTemplateCard: React.FC = () => {
  const handleDownloadTemplate = () => {
    const csvContent = generateEmployeeCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'modelo_colaboradores.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Modelo de Colaboradores</CardTitle>
        <CardDescription className="text-muted-foreground">
          Descarregue um modelo CSV para a tabela de colaboradores.
          As colunas "company_excel_id" e "Nome do Colaborador" são obrigatórias.
          O "ID do Stand (Excel)" deve corresponder a um `Stand_ID` existente na tabela `stands`.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDownloadTemplate} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Descarregar Modelo CSV de Colaboradores
        </Button>
        <p className="text-sm text-muted-foreground">
          Use este modelo para preparar os seus dados antes de os carregar.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmployeeExcelTemplateCard;