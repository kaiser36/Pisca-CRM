"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSession } from '@/context/SessionContext';
import { fetchAllAnalytics, deleteAnalytic } from '@/integrations/supabase/services/analyticsService';
import { Analytics as AnalyticsType } from '@/types/crm';
import { showSuccess, showError } from '@/utils/toast';
import AnalyticsTable from '@/components/analytics/AnalyticsTable';
import AnalyticsCreateForm from '@/components/analytics/AnalyticsCreateForm';
import AnalyticsEditForm from '@/components/analytics/AnalyticsEditForm';
import { useDebounce } from '@/hooks/use-debounce';

const Analytics: React.FC = () => {
  const { user } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAnalytic, setSelectedAnalytic] = useState<AnalyticsType | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [analyticToDelete, setAnalyticToDelete] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await fetchAllAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      showError(`Erro ao carregar análises: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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

  const confirmDelete = async () => {
    if (!analyticToDelete) return;
    try {
      await deleteAnalytic(analyticToDelete);
      showSuccess('Análise apagada com sucesso!');
      loadAnalytics();
    } catch (error: any) {
      showError(`Erro ao apagar análise: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setAnalyticToDelete(null);
    }
  };

  const filteredAnalytics = useMemo(() => {
    if (!debouncedSearchTerm) return analytics;
    return analytics.filter(analytic =>
      analytic.company_commercial_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [analytics, debouncedSearchTerm]);

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">Análise de Campanhas</h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Pesquisar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
            <AnalyticsCreateForm onSuccess={loadAnalytics} />
          </div>
        </div>
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Visão Geral das Análises</CardTitle>
            <CardDescription className="text-muted-foreground">
              Veja, adicione, edite e apague análises detalhadas das campanhas dos clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <AnalyticsTable
                analytics={filteredAnalytics}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {selectedAnalytic && (
        <AnalyticsEditForm
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          analytic={selectedAnalytic}
          onSuccess={loadAnalytics}
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
    </Layout>
  );
};

export default Analytics;