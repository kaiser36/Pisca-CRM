"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Analytics as AnalyticsType } from '@/types/crm';
import { fetchAnalyticsByCompanyExcelId, deleteAnalytic } from '@/integrations/supabase/services/analyticsService';
import { useSession } from '@/context/SessionContext';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AnalyticsEditForm from '@/components/analytics/AnalyticsEditForm';
import AnalyticsKPIDashboard from '@/components/analytics/AnalyticsKPIDashboard';
import { Checkbox } from '@/components/ui/checkbox';
import AnalyticsComparisonDashboard from '@/components/analytics/AnalyticsComparisonDashboard';

interface AnalyticsListProps {
  companyExcelId: string;
  onAnalyticsChanged: () => void;
}

const AnalyticsList: React.FC<AnalyticsListProps> = ({ companyExcelId, onAnalyticsChanged }) => {
  const { user } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAnalytic, setSelectedAnalytic] = useState<AnalyticsType | null>(null);

  const [selectedAnalyticsForDashboard, setSelectedAnalyticsForDashboard] = useState<AnalyticsType[]>([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [analyticToDelete, setAnalyticToDelete] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!user || !companyExcelId) return;
    setIsLoading(true);
    try {
      const data = await fetchAnalyticsByCompanyExcelId(user.id, companyExcelId);
      setAnalytics(data);
    } catch (error: any) {
      showError(`Erro ao carregar análises: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, companyExcelId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleEdit = (analytic: AnalyticsType) => {
    setSelectedAnalytic(analytic);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (analyticId: string) => {
    setAnalyticToDelete(analyticId);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleSelectionForDashboard = (analytic: AnalyticsType) => {
    setSelectedAnalyticsForDashboard(prevSelected => {
      const isSelected = prevSelected.some(a => a.id === analytic.id);
      if (isSelected) {
        return prevSelected.filter(a => a.id !== analytic.id);
      } else {
        return [...prevSelected, analytic];
      }
    });
  };

  const confirmDelete = async () => {
    if (!analyticToDelete) return;
    try {
      await deleteAnalytic(analyticToDelete);
      showSuccess('Análise apagada com sucesso!');
      loadAnalytics();
      onAnalyticsChanged();
      setSelectedAnalyticsForDashboard(prev => prev.filter(a => a.id !== analyticToDelete));
    } catch (error: any) {
      showError(`Erro ao apagar análise: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setAnalyticToDelete(null);
    }
  };
  
  const formatCurrency = (value?: number | null) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Campanha</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Nenhuma análise encontrada para esta empresa.</TableCell>
              </TableRow>
            ) : (
              analytics.map(item => {
                const isSelected = selectedAnalyticsForDashboard.some(a => a.id === item.id);
                return (
                  <TableRow 
                    key={item.id} 
                    data-state={isSelected ? 'selected' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelectionForDashboard(item)}
                        aria-label={`Selecionar ${item.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{formatDate(item.start_date)} - {formatDate(item.end_date)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(item)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item.id!)} className="text-destructive">Apagar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedAnalyticsForDashboard.length === 1 && (
        <div className="mt-8">
          <AnalyticsKPIDashboard analytic={selectedAnalyticsForDashboard[0]} />
        </div>
      )}
      
      {selectedAnalyticsForDashboard.length > 1 && (
        <AnalyticsComparisonDashboard analytics={selectedAnalyticsForDashboard} />
      )}

      {selectedAnalytic && (
        <AnalyticsEditForm
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          analytic={selectedAnalytic}
          onSuccess={() => {
            loadAnalytics();
            onAnalyticsChanged();
          }}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá apagar permanentemente a análise da campanha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AnalyticsList;