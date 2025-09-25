"use client";

import React, { useEffect, useState } from 'react';
import { EasyvistaType } from '@/types/crm';
import { fetchEasyvistaTypes, deleteEasyvistaType } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Tag, Edit, Trash, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EasyvistaTypeEditForm from './EasyvistaTypeEditForm'; // Reescrevido

interface EasyvistaTypeListProps {
  onTypeChanged: () => void; // Callback to refresh list after changes
}

const EasyvistaTypeList: React.FC<EasyvistaTypeListProps> = ({ onTypeChanged }) => {
  const [easyvistaTypes, setEasyvistaTypes] = useState<EasyvistaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EasyvistaType | null>(null);

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

  const loadEasyvistaTypes = async () => {
    if (!userId) {
      setError("Utilizador não autenticado. Por favor, faça login para ver os tipos de Easyvista.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTypes = await fetchEasyvistaTypes(userId);
      setEasyvistaTypes(fetchedTypes);
    } catch (err: any) {
      console.error("Erro ao carregar tipos de Easyvista:", err);
      setError(err.message || "Falha ao carregar os tipos de Easyvista.");
      showError(err.message || "Falha ao carregar os tipos de Easyvista.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadEasyvistaTypes();
    }
  }, [userId, onTypeChanged]); // Add onTypeChanged to dependencies to trigger reload

  const handleDelete = async (typeId: string) => {
    try {
      await deleteEasyvistaType(typeId);
      showSuccess("Tipo de Easyvista eliminado com sucesso!");
      onTypeChanged(); // Trigger parent to reload list
    } catch (err: any) {
      console.error("Erro ao eliminar tipo de Easyvista:", err);
      showError(err.message || "Falha ao eliminar o tipo de Easyvista.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
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
        {easyvistaTypes.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum tipo de Easyvista encontrado.</p>
        ) : (
          easyvistaTypes.map((type) => (
            <Card key={type.id} className="w-full shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg font-semibold">{type.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedType(type); setIsEditDialogOpen(true); }}>
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
                            Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o tipo de Easyvista "{type.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => type.id && handleDelete(type.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Criado em: {type.created_at ? new Date(type.created_at).toLocaleString() : 'N/A'}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedType && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Tipo de Easyvista</DialogTitle>
            </DialogHeader>
            <EasyvistaTypeEditForm
              easyvistaType={selectedType}
              onSave={() => {
                setIsEditDialogOpen(false);
                onTypeChanged(); // Refresh the list after saving
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </ScrollArea>
  );
};

export default EasyvistaTypeList;