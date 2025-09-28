"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/context/SessionContext';
import { fetchAllAnalytics } from '@/integrations/supabase/services/analyticsService';
import { Analytics as AnalyticsType } from '@/types/crm';
import { showError } from '@/utils/toast';
import AnalyticsTable from '@/components/analytics/AnalyticsTable';
import AnalyticsCreateForm from '@/components/analytics/AnalyticsCreateForm';

const Analytics: React.FC = () => {
  const { user } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Análise de Campanhas</h1>
          <AnalyticsCreateForm onSuccess={loadAnalytics} />
        </div>
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Visão Geral das Análises</CardTitle>
            <CardDescription className="text-muted-foreground">
              Veja e adicione análises detalhadas das campanhas dos clientes.
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
              <AnalyticsTable analytics={analytics} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;