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
import { PlusCircle, Trash2, Loader2, Edit3, MessageSquare, ListChecks } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const ContactTypeManagement: React.FC = () => {
  const { user } = useSession();
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [newReportText, setNewReportText] = useState<{ [key: string]: string }>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'type' | 'report', id: string, name?: string } | null>(null);

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

  const handleDeleteRequest = (type: 'type' | 'report', id: string, name?: string) => {
    setItemToDelete({ type, id, name });
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
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestão de Tipos de Contato</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure tipos de contato e as respetivas opções de relatório para padronizar o registo de interações
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-blue-600" />
                  Tipos de Contato
                </CardTitle>
                <CardDescription className="mt-1">
                  Crie e gerencie tipos de contato com as suas opções de relatório
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Tipo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg">Criar Novo Tipo de Contato</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="space-y-2">
                      <label htmlFor="typeName" className="text-sm font-medium">
                        Nome do Tipo
                      </label>
                      <Input
                        id="typeName"
                        placeholder="Ex: Chamada, Email, Visita"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setNewTypeName('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateType} 
                      disabled={isSubmitting || !newTypeName.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              </div>
            ) : contactTypes.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhum tipo de contato
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Comece criando o seu primeiro tipo de contato
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Tipo de Contato
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {contactTypes.map((type, index) => (
                  <AccordionItem 
                    key={type.id} 
                    value={type.id}
                    className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {type.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {type.contact_report_options?.length || 0} opções de relatório
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {type.contact_report_options?.length || 0} relatórios
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleDeleteRequest('type', type.id, type.name); 
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <Separator className="mb-4" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <ListChecks className="h-4 w-4" />
                            Opções de Relatório
                          </h4>
                        </div>
                        
                        {type.contact_report_options && type.contact_report_options.length > 0 ? (
                          <div className="grid gap-2">
                            {type.contact_report_options.map((report) => (
                              <div 
                                key={report.id} 
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <span className="text-gray-700 dark:text-gray-300">
                                  {report.report_text}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteRequest('report', report.id, report.report_text)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma opção de relatório definida</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Input
                            placeholder="Adicionar nova opção de relatório"
                            value={newReportText[type.id] || ''}
                            onChange={(e) => setNewReportText(prev => ({ ...prev, [type.id]: e.target.value }))}
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => handleAddReport(type.id)} 
                            disabled={isSubmitting || !newReportText[type.id]?.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
                          </Button>
                        </div>
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
            <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que quer eliminar {itemToDelete?.type === 'type' ? 'o tipo de contato' : 'a opção de relatório'} 
              {itemToDelete?.name ? ` "${itemToDelete.name}"` : ''}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ContactTypeManagement;