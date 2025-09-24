"use client";

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Separator } from '@/components/ui/separator';

interface CompanyOverviewDashboardProps {
  // Pode adicionar props se precisar de passar dados ou callbacks do pai
}

const CompanyOverviewDashboard: React.FC<CompanyOverviewDashboardProps> = () => {
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados dos filtros
  const [planStatusFilter, setPlanStatusFilter] = useState<string>('all'); // 'all', 'active', 'inactive'
  const [credibomPartnerFilter, setCredibomPartnerFilter] = useState<string>('all'); // 'all', 'yes', 'no'
  const [accountAMFilter, setAccountAMFilter] = useState<string>('all'); // 'all' ou um valor de AM
  const [availableAMs, setAvailableAMs] = useState<string[]>([]); // Lista de AMs únicos

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

  const fetchCompanies = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setError("Utilizador não autenticado. Por favor, faça login para ver os dados.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('companies')
        .select('id, plan_active, is_crb_partner, am_current', { count: 'exact' })
        .eq('user_id', userId);

      if (planStatusFilter === 'active') {
        query = query.eq('plan_active', true);
      } else if (planStatusFilter === 'inactive') {
        query = query.eq('plan_active', false);
      }

      if (credibomPartnerFilter === 'yes') {
        query = query.eq('is_crb_partner', true);
      } else if (credibomPartnerFilter === 'no') {
        query = query.eq('is_crb_partner', false);
      }

      if (accountAMFilter !== 'all') {
        query = query.eq('am_current', accountAMFilter);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Erro ao carregar empresas:", error);
        throw new Error(error.message);
      }

      setTotalCompanies(count || 0);

      const { data: amsData, error: amsError } = await supabase
        .from('companies')
        .select('am_current')
        .eq('user_id', userId)
        .not('am_current', 'is', null)
        .not('am_current', 'eq', '');

      if (amsError) {
        console.error("Erro ao carregar AMs disponíveis:", amsError);
      } else {
        const uniqueAMs = Array.from(new Set(amsData.map(c => c.am_current as string))).sort();
        setAvailableAMs(uniqueAMs);
      }

    } catch (err: any) {
      setError(err.message || "Falha ao carregar os dados das empresas.");
      showError(err.message || "Falha ao carregar os dados das empresas.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, planStatusFilter, credibomPartnerFilter, accountAMFilter]);

  useEffect(() => {
    if (userId) {
      fetchCompanies();
    }
  }, [userId, fetchCompanies]);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <Building className="mr-2 h-5 w-5 text-blue-500" />
          Número Total de Empresas
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Visão geral e filtragem das empresas no seu CRM.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6"> {/* Increased spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="plan-status-filter" className="text-sm font-medium">Estado do Plano</Label>
            <Select value={planStatusFilter} onValueChange={setPlanStatusFilter} disabled={isLoading}>
              <SelectTrigger id="plan-status-filter" className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1">
            <Label htmlFor="credibom-partner-filter" className="text-sm font-medium">Parceiro Credibom</Label>
            <Select value={credibomPartnerFilter} onValueChange={setCredibomPartnerFilter} disabled={isLoading}>
              <SelectTrigger id="credibom-partner-filter" className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Sim</SelectItem>
                <SelectItem value="no">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1">
            <Label htmlFor="account-am-filter" className="text-sm font-medium">Account (AM)</Label>
            <Select value={accountAMFilter} onValueChange={setAccountAMFilter} disabled={isLoading}>
              <SelectTrigger id="account-am-filter" className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableAMs.map(am => (
                  <SelectItem key={am} value={am}>{am}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4" />

        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-24 text-red-500">
            {error}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-6xl font-extrabold text-primary">{totalCompanies}</p>
            <p className="text-lg text-muted-foreground mt-2">Empresas Encontradas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyOverviewDashboard;