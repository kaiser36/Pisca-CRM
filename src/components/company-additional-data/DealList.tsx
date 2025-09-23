"use client";

import React, { useEffect, useState } from 'react';
import { Negocio } from '@/types/crm';
import { fetchDealsByCompanyExcelId } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, DollarSign, Tag, Info, MessageSquareText, Clock, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface DealListProps {
  companyExcelId: string;
}

const DealList: React.FC<DealListProps> = ({ companyExcelId }) => {
  const [deals, setDeals] = useState<Negocio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

  const loadDeals = async () => {
    if (!userId) {
      setError("Utilizador não autenticado. Por favor, faça login para ver os negócios.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedDeals = await fetchDealsByCompanyExcelId(userId, companyExcelId);
      setDeals(fetchedDeals);
    } catch (err: any) {
      console.error("Erro ao carregar negócios:", err);
      setError(err.message || "Falha ao carregar os negócios.");
      showError(err.message || "Falha ao carregar os negócios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && companyExcelId) {
      loadDeals();
    }
  }, [userId, companyExcelId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !label.includes('Valor'))) return null;

    let displayValue: React.ReactNode = value;
    if (label.includes('Data')) {
      try {
        displayValue = format(new Date(String(value)), 'dd/MM/yyyy');
      } catch {
        displayValue = String(value);
      }
    } else if (label.includes('Valor')) {
      displayValue = `${Number(value).toFixed(2)} ${deals[0]?.currency || 'EUR'}`;
    }

    return (
      <div className="flex items-center text-sm">
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}:</span> <span className="ml-1 text-foreground">{displayValue}</span>
      </div>
    );
  };

  return (
    <ScrollArea className="h-full w-full pr-4">
      <div className="space-y-4">
        {deals.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum negócio encontrado para esta empresa.</p>
        ) : (
          deals.map((deal) => (
            <Card key={deal.id} className="w-full shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">{deal.deal_name}</CardTitle>
                <CardDescription className="text-muted-foreground">ID Excel da Empresa: {deal.company_excel_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {renderField(Tag, "Status", deal.deal_status)}
                  {renderField(DollarSign, "Valor", deal.deal_value)}
                  {renderField(Calendar, "Data de Fecho Esperada", deal.expected_close_date)}
                  {renderField(TrendingUp, "Etapa", deal.stage)}
                  {renderField(Info, "Prioridade", deal.priority)}
                </div>
                {deal.notes && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start text-sm">
                      <MessageSquareText className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      <span className="font-medium">Notas:</span> <span className="ml-1 flex-1 text-foreground">{deal.notes}</span>
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Criado em: {deal.created_at ? format(new Date(deal.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'} | Última atualização: {deal.updated_at ? format(new Date(deal.updated_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default DealList;