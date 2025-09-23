"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Negocio } from '@/types/crm';
import { fetchDealsByCompanyExcelId } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, DollarSign, Tag, Info, MessageSquareText, Clock, TrendingUp, Handshake } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DealListProps {
  companyExcelId: string;
}

// Define a ordem dos status para as colunas do pipeline
const DEAL_STATUSES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

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

  // Agrupar negócios por status
  const dealsByStatus = useMemo(() => {
    const grouped: { [key: string]: Negocio[] } = {};
    DEAL_STATUSES.forEach(status => {
      grouped[status] = [];
    });
    deals.forEach(deal => {
      const status = deal.deal_status || 'Prospecting'; // Default status
      if (grouped[status]) {
        grouped[status].push(deal);
      } else {
        // Handle unexpected statuses by putting them in a generic 'Other' category or first category
        grouped['Prospecting'].push(deal); 
      }
    });
    return grouped;
  }, [deals]);

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

  const renderDealCard = (deal: Negocio) => {
    const displayValue = (value: string | number | boolean | null | undefined, prefix: string = '', suffix: string = '') => {
      if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !prefix.includes('Valor'))) return null;
      if (typeof value === 'number') return `${prefix}${value.toFixed(2)}${suffix}`;
      return `${prefix}${String(value)}${suffix}`;
    };

    return (
      <Card key={deal.id} className="w-full mb-3 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{deal.deal_name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">ID Excel: {deal.company_excel_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div className="flex items-center text-xs">
            <DollarSign className="mr-1 h-3 w-3 text-muted-foreground" />
            <span className="font-medium">Valor:</span> <span className="ml-1 text-foreground">{displayValue(deal.deal_value, '', ` ${deal.currency || 'EUR'}`)}</span>
          </div>
          {deal.expected_close_date && (
            <div className="flex items-center text-xs">
              <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Fecho Esperado:</span> <span className="ml-1 text-foreground">{format(new Date(deal.expected_close_date), 'dd/MM/yyyy')}</span>
            </div>
          )}
          {deal.priority && (
            <div className="flex items-center text-xs">
              <Info className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Prioridade:</span> <span className="ml-1 text-foreground">{deal.priority}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const allDealsEmpty = deals.length === 0;

  return (
    <div className="flex flex-col h-full">
      {allDealsEmpty ? (
        <p className="text-muted-foreground text-center py-4">Nenhum negócio encontrado para esta empresa.</p>
      ) : (
        <ScrollArea className="flex-1 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
            {DEAL_STATUSES.map(status => (
              <div key={status} className="flex flex-col bg-muted/40 rounded-lg p-3 shadow-inner border border-muted-foreground/10">
                <h4 className="font-semibold text-lg mb-3 flex items-center text-primary">
                  <Handshake className="mr-2 h-5 w-5" /> {status} ({dealsByStatus[status]?.length || 0})
                </h4>
                <ScrollArea className="flex-1 max-h-[calc(100vh-250px)]"> {/* Adjust max-height as needed */}
                  <div className="space-y-3 pr-2">
                    {dealsByStatus[status]?.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-4">Nenhum negócio neste status.</p>
                    ) : (
                      dealsByStatus[status]?.map(renderDealCard)
                    )}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default DealList;