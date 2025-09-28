"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Analytics } from '@/types/crm';
import { format } from 'date-fns';

interface AnalyticsTableProps {
  analytics: Analytics[];
}

const AnalyticsTable: React.FC<AnalyticsTableProps> = ({ analytics }) => {
  const formatCurrency = (value?: number | null) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campanha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Visualizações</TableHead>
            <TableHead>Cliques</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Custo Total</TableHead>
            <TableHead>Receita</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analytics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">Nenhuma análise encontrada.</TableCell>
            </TableRow>
          ) : (
            analytics.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.company_commercial_name}</TableCell>
                <TableCell>{formatDate(item.start_date)} - {formatDate(item.end_date)}</TableCell>
                <TableCell>{item.views ?? 0}</TableCell>
                <TableCell>{item.clicks ?? 0}</TableCell>
                <TableCell>{item.leads_email ?? 0}</TableCell>
                <TableCell>{formatCurrency(item.total_cost)}</TableCell>
                <TableCell>{formatCurrency(item.revenue)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AnalyticsTable;