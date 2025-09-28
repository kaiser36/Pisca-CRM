"use client";

import React, { useEffect, useState } from 'react';
import { Analytics } from '@/types/crm';
import { fetchAnalyticsByCompanyExcelId, deleteAnalytics } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, Tag, Info, Edit, Trash, MoreHorizontal, FileText, BarChart3 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AnalyticsEditForm from './AnalyticsEditForm';
import { Badge } from '@/components/ui/badge'; // Import Badge component

interface AnalyticsListProps {
  companyExcelId: string;
  onAnalyticsChanged: () => void; // Callback to refresh list after changes
}

const AnalyticsList: React.FC<AnalyticsListProps> = ({ companyExcelId, onAnalyticsChanged }) => {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState<Analytics | null>(null);

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

  const loadAnalytics = async () => {
    if (!userId) {
      setError("Utilizador não autenticado. Por favor, faça login para ver as análises.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAnalytics = await fetchAnalyticsByCompanyExcelId(userId, companyExcelId);
      setAnalytics(fetchedAnalytics);
    } catch (err: any) {
      console.error("Erro ao carregar análises:", err);
      setError(err.message || "Falha ao carregar as análises.");
      showError(err.message || "Falha ao carregar as análises.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && companyExcelId) {
      loadAnalytics();
    }
  }, [userId, companyExcelId, onAnalyticsChanged]);

  const handleDelete = async (analyticsId: string) => {
    try {
      await deleteAnalytics(analyticsId);
      showSuccess("Análise eliminada com sucesso!");
      onAnalyticsChanged(); // Trigger parent to reload list
    } catch (err: any) {
      console.error("Erro ao eliminar análise:", err);
      showError(err.message || "Falha ao eliminar a análise.");
    }
  };

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;

    let displayValue: React.ReactNode = value;
    if (label.includes('Data') && typeof value === 'string') {
      try {
        displayValue = format(parseISO(value), 'dd/MM/yyyy');
      } catch {
        displayValue = String(value);
      }
    }

    return (
      <div className="flex items-center text-sm">
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}:</span> <span className="ml-1 text-foreground">{displayValue}</span>
      </div>
    );
  };

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

  return (
    <ScrollArea className="h-full w-full pr-4">
      <div className="space-y-4">
        {analytics.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhuma análise encontrada para esta empresa.</p>
        ) : (
          analytics.map((analysis) => (
            <Card key={analysis.id} className="w-full shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg font-semibold">{analysis.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {analysis.category && <Badge variant="secondary">{analysis.category}</Badge>}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedAnalytics(analysis); setIsEditDialogOpen(true); }}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash className="mr-2 h-4 w-4 text-red-500" /> <span className="text-red-500">Eliminar</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isto irá eliminar permanentemente a análise "{analysis.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => analysis.id && handleDelete(analysis.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {renderField(Calendar, "Data da Análise", analysis.analysis_date)}
                  {renderField(Tag, "Categoria", analysis.category)}
                </div>
                {analysis.description && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start text-sm">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      <span className="font-medium">Descrição:</span> <span className="ml-1 flex-1 text-foreground">{analysis.description}</span>
                    </div>
                  </>
                )}
                {analysis.result && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start text-sm">
                      <Info className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      <span className="font-medium">Resultado:</span> <span className="ml-1 flex-1 text-foreground">{analysis.result}</span>
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Criado em: {analysis.created_at ? new Date(analysis.created_at).toLocaleString() : 'N/A'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedAnalytics && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Análise</DialogTitle>
            </DialogHeader>
            <AnalyticsEditForm
              analytics={selectedAnalytics}
              onSave={() => {
                setIsEditDialogOpen(false);
                onAnalyticsChanged();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </ScrollArea>
  );
};

export default AnalyticsList;