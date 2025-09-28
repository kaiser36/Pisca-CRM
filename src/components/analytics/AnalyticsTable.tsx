"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Analytics } from '@/types/crm';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

interface AnalyticsTableProps {
  analytics: Analytics[];
  onEdit: (analytic: Analytics) => void;
  onDelete: (analyticId: string) => void;
}

const AnalyticsTable: React.FC<AnalyticsTableProps> = ({ analytics, onEdit, onDelete }) => {
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
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analytics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">Nenhuma análise encontrada.</TableCell>
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(item.id!)} className="text-destructive">Apagar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AnalyticsTable;