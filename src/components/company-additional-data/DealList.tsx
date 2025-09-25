"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Negocio, DealProduct } from '@/types/crm';
import { fetchDealsByCompanyExcelId, updateDeal, deleteDeal } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, DollarSign, Tag, Info, MessageSquareText, Clock, TrendingUp, Handshake, Search, FileText, CheckCircle, XCircle, MoreHorizontal, Edit, Trash, ArrowLeft, ArrowRight, Building, Package, Gift } from 'lucide-react'; // NEW: Import Gift icon
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import DealEditForm from './DealEditForm';

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

// Mapeamento de estilos para cada status
const DEAL_STATUS_STYLES: {
  [key: string]: {
    icon: React.ElementType;
    textColor: string;
    bgColor: string;
    borderColor: string;
  };
} = {
  "Prospecting": {
    icon: Tag,
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  "Qualification": {
    icon: Search,
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  "Proposal": {
    icon: FileText,
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  "Negotiation": {
    icon: Handshake,
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  "Closed Won": {
    icon: CheckCircle,
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  "Closed Lost": {
    icon: XCircle,
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

const DealList: React.FC<DealListProps> = ({ companyExcelId }) => {
  const [deals, setDeals] = useState<Negocio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Negocio | null>(null);

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

  const handleDelete = async (dealId: string) => {
    try {
      await deleteDeal(dealId);
      showSuccess("Negócio eliminado com sucesso!");
      loadDeals(); // Refresh the list
    } catch (err: any) {
      console.error("Erro ao eliminar negócio:", err);
      showError(err.message || "Falha ao eliminar o negócio.");
    }
  };

  const handleMoveDeal = async (deal: Negocio, direction: 'next' | 'prev') => {
    const currentIndex = DEAL_STATUSES.indexOf(deal.deal_status || 'Prospecting');
    let newIndex = -1;

    if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else {
      newIndex = currentIndex - 1;
    }

    if (newIndex >= 0 && newIndex < DEAL_STATUSES.length) {
      const newStatus = DEAL_STATUSES[newIndex];
      try {
        await updateDeal(deal.id!, { deal_status: newStatus });
        showSuccess(`Negócio "${deal.deal_name}" movido para "${newStatus}" com sucesso!`);
        loadDeals(); // Refresh the list
      } catch (err: any) {
        console.error("Erro ao mover negócio:", err);
        showError(err.message || "Falha ao mover o negócio.");
      }
    }
  };

  const renderDealCard = (deal: Negocio) => {
    const displayValue = (value: string | number | boolean | null | undefined, prefix: string = '', suffix: string = '') => {
      if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !prefix.includes('Valor'))) return null;
      if (typeof value === 'number') return `${prefix}${value.toFixed(2)}${suffix}`;
      return `${prefix}${String(value)}${suffix}`;
    };

    const currentIndex = DEAL_STATUSES.indexOf(deal.deal_status || 'Prospecting');
    const canMovePrev = currentIndex > 0;
    const canMoveNext = currentIndex < DEAL_STATUSES.length - 1;

    return (
      <Card key={deal.id} className="w-full mb-3 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">{deal.deal_name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedDeal(deal); setIsEditDialogOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}> {/* Prevent dropdown close */}
                    <Trash className="mr-2 h-4 w-4 text-red-500" /> <span className="text-red-500">Eliminar</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o negócio "{deal.deal_name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deal.id && handleDelete(deal.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div className="flex items-center text-xs">
            <Building className="mr-1 h-3 w-3 text-muted-foreground" />
            <span className="font-medium">Empresa:</span> <span className="ml-1 text-foreground">{deal.commercial_name || 'N/A'}</span>
          </div>

          {deal.campaign_name && ( // NEW: Display campaign name
            <div className="flex items-center text-xs">
              <Gift className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Campanha:</span> <span className="ml-1 text-foreground">{deal.campaign_name}</span>
            </div>
          )}

          {deal.deal_products && deal.deal_products.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="font-medium text-xs flex items-center">
                <Package className="mr-1 h-3 w-3 text-muted-foreground" /> Produtos:
              </p>
              {deal.deal_products.map((dp: DealProduct, idx: number) => (
                <div key={idx} className="ml-4 text-xs text-muted-foreground">
                  - {dp.product_name} ({dp.quantity}x)
                  {dp.discount_type !== 'none' && dp.discount_value !== null && dp.discount_value !== undefined && (
                    <span className="ml-1 text-orange-600">
                      (Desc. {dp.discount_type === 'percentage' ? `${dp.discount_value}%` : `${dp.discount_value?.toFixed(2)} €`})
                    </span>
                  )}
                  <span className="ml-1 font-semibold">{displayValue(dp.total_price_at_deal_time, '', ` ${deal.currency || 'EUR'}`)}</span>
                </div>
              ))}
            </div>
          )}

          {deal.deal_value !== null && deal.deal_value !== undefined && (
            <div className="flex items-center text-xs">
              <DollarSign className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Valor (Pré-Desc. Geral):</span> <span className="ml-1 text-foreground">{displayValue(deal.deal_value, '', ` ${deal.currency || 'EUR'}`)}</span>
            </div>
          )}
          {deal.discount_type !== 'none' && deal.discount_value !== null && deal.discount_value !== undefined && (
            <div className="flex items-center text-xs">
              <Tag className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Desconto Geral ({deal.discount_type === 'percentage' ? '%' : '€'}):</span> <span className="ml-1 text-foreground">
                {deal.discount_type === 'percentage' ? `${deal.discount_value}%` : `${deal.discount_value?.toFixed(2)} €`}
              </span>
            </div>
          )}
          {deal.final_deal_value !== null && deal.final_deal_value !== undefined && (
            <div className="flex items-center text-xs font-bold text-green-700">
              <DollarSign className="mr-1 h-3 w-3 text-green-700" />
              <span className="font-medium">Valor Final:</span> <span className="ml-1">{displayValue(deal.final_deal_value, '', ` ${deal.currency || 'EUR'}`)}</span>
            </div>
          )}
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
          <div className="flex justify-between mt-2 pt-2 border-t border-muted-foreground/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMoveDeal(deal, 'prev')}
              disabled={!canMovePrev}
              className="h-6 w-6"
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMoveDeal(deal, 'next')}
              disabled={!canMoveNext}
              className="h-6 w-6"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
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
            {DEAL_STATUSES.map(status => {
              const { icon: StatusIcon, textColor, bgColor, borderColor } = DEAL_STATUS_STYLES[status] || DEAL_STATUS_STYLES["Prospecting"]; // Fallback to Prospecting
              return (
                <div
                  key={status}
                  className={cn(
                    "flex flex-col rounded-lg p-3 shadow-inner border",
                    bgColor,
                    borderColor
                  )}
                >
                  <h4 className={cn("font-semibold text-lg mb-3 flex items-center", textColor)}>
                    <StatusIcon className="mr-2 h-5 w-5" /> {status} ({dealsByStatus[status]?.length || 0})
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
              );
            })}
          </div>
        </ScrollArea>
      )}

      {selectedDeal && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Negócio</DialogTitle>
            </DialogHeader>
            <DealEditForm
              deal={selectedDeal}
              onSave={() => {
                setIsEditDialogOpen(false);
                loadDeals(); // Refresh the list after saving
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DealList;