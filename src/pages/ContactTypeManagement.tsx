"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { useSession } from '@/context/SessionContext';
import { ContactType } from '@/types/crm';
import { fetchContactTypesWithReports, insertContactType, deleteContactType, insertReportOption, deleteReportOption } from '@/integrations/supabase/utils';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ContactTypeManagement: React.FC = () => {
  const { user } = useSession();
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [newReportText, setNewReportText] = useState<{ [key: string]: string }>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'type' | 'report', id: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await fetchContactTypesWithReports(user.id);
      setContactTypes(data);
    } catch (error: any) {
      showError(`Erro ao carregar tipos de contato: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateType = async () => {
    if (!user || !newTypeName.trim()) return;
    setIsSubmitting(true);
    try {
      await insertContactType(user.id, newTypeName.trim());
      showSuccess('Tipo de contato criado com sucesso!');
      setNewTypeName('');
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReport = async (contactTypeId: string) => {
    if (!user || !newReportText[contactTypeId]?.trim()) return;
    setIsSubmitting(true);
    try {
      await insertReportOption(user.id, contactTypeId, newReportText[contactTypeId].trim());
      showSuccess('Opção de relatório adicionada!');
      setNewReportText(prev => ({ ...prev, [contactTypeId]: '' }));
      loadData();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (type: 'type' | 'report', id: string) => {
    setItemToDelete({ type, id });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      if (itemToDelete.type === 'type') {
        await deleteContactType(itemToDelete.id);
        showSuccess('Tipo de contato apagado.');
      } else {
        await deleteReportOption(itemToDelete.id);
        showSuccess('Opção de relatório apagada.');
      }
      loadData();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Gestão de Tipos de Contato</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tipos de Contato e Relatórios</CardTitle>
              <CardDescription>Crie e gira os tipos de contato e as suas opções de relatório.</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Tipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Tipo de Contato</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Nome do tipo de contato (ex: Chamada)"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateType} disabled={isSubmitting || !newTypeName.trim()}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>A carregar...</p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {contactTypes.map(type => (
                  <AccordionItem key={type.id} value={type.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-semibold text-lg">{type.name}</span>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteRequest('type', type.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4 pr-2">
                      <h4 className="font-semibold mb-2">Opções de Relatório:</h4>
                      <ul className="space-y-2 mb-4">
                        {type.contact_report_options?.map(report => (
                          <li key={report.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                            <span>{report.report_text}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest('report', report.id)}>
                              <Trash2 className="h-4 w-4 text-destructive/70" />
                            </Button>
                          </li>
                        ))}
                        {(!type.contact_report_options || type.contact_report_options.length === 0) && (
                          <p className="text-sm text-muted-foreground">Nenhuma opção de relatório definida.</p>
                        )}
                      </ul>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Adicionar nova opção de relatório"
                          value={newReportText[type.id] || ''}
                          onChange={(e) => setNewReportText(prev => ({ ...prev, [type.id]: e.target.value }))}
                        />
                        <Button onClick={() => handleAddReport(type.id)} disabled={isSubmitting || !newReportText[type.id]?.trim()}>
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá apagar o item permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ContactTypeManagement;