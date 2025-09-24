"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Keep shadcn/ui Select for now
import { Label } from '@/components/ui/label'; // Keep shadcn/ui Label for now
import { Loader2, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Separator } from '@/components/ui/separator'; // Keep Separator for now

import MuiCard from '@mui/material/Card'; // Import MUI Card
import MuiCardContent from '@mui/material/CardContent'; // Import MUI CardContent
import MuiCardHeader from '@mui/material/CardHeader'; // Import MUI CardHeader
import Typography from '@mui/material/Typography'; // Import MUI Typography
import Box from '@mui/material/Box'; // Import MUI Box for layout

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
    <MuiCard sx={{ width: '100%', boxShadow: 3 }}>
      <MuiCardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Building className="mr-2 h-5 w-5 text-blue-500" />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold' }}>Número Total de Empresas</Typography>
          </Box>
        }
        subheader="Visão geral e filtragem das empresas no seu CRM."
        subheaderTypographyProps={{ color: 'text.secondary' }}
        sx={{ pb: 1.5 }}
      />
      <MuiCardContent sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
          </Box>
        </Box>

        <Separator className="my-4" />

        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 96 }}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 96, color: 'error.main' }}>
            {error}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h2" component="p" sx={{ fontWeight: 'extrabold', color: 'primary.main' }}>{totalCompanies}</Typography>
            <Typography variant="h6" component="p" sx={{ color: 'text.secondary', mt: 1 }}>Empresas Encontradas</Typography>
          </Box>
        )}
      </MuiCardContent>
    </MuiCard>
  );
};

export default CompanyOverviewDashboard;