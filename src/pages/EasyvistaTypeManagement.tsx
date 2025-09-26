"use client";

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout'; // Corrigido para importação nomeada
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { showSuccess, showError } from '@/utils/toast';
import { useEffect, useCallback } from 'react';
import { EasyvistaType } from '@/types/crm'; // Assuming EasyvistaType is defined

export default function EasyvistaTypeManagement() {
  const { user } = useAuth();
  const [easyvistaTypes, setEasyvistaTypes] = useState<EasyvistaType[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState<EasyvistaType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [displayFieldsInput, setDisplayFieldsInput] = useState('');

  const fetchEasyvistaTypes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('easyvista_types')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching Easyvista types:', error);
      showError('Erro ao carregar tipos de Easyvista.');
    } else {
      setEasyvistaTypes(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEasyvistaTypes();
  }, [fetchEasyvistaTypes]);

  const handleCreateOrUpdate = async () => {
    if (!user || !newTypeName.trim()) {
      showError('O nome do tipo de Easyvista não pode estar vazio.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(editingType ? 'A atualizar tipo...' : 'A criar tipo...');

    try {
      const fieldsArray = displayFieldsInput.split(',').map(field => field.trim()).filter(field => field !== '');

      if (editingType) {
        const { error } = await supabase
          .from('easyvista_types')
          .update({ name: newTypeName, display_fields: fieldsArray })
          .eq('id', editingType.id);

        if (error) throw error;
        showSuccess('Tipo de Easyvista atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('easyvista_types')
          .insert({ user_id: user.id, name: newTypeName, display_fields: fieldsArray });

        if (error) throw error;
        showSuccess('Tipo de Easyvista criado com sucesso!');
      }
      setNewTypeName('');
      setDisplayFieldsInput('');
      setEditingType(null);
      fetchEasyvistaTypes();
    } catch (error: any) {
      console.error('Error saving Easyvista type:', error);
      showError(`Erro ao guardar tipo de Easyvista: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
      setSubmitting(false);
    }
  };

  const handleEdit = (type: EasyvistaType) => {
    setEditingType(type);
    setNewTypeName(type.name);
    setDisplayFieldsInput(type.display_fields ? type.display_fields.join(', ') : '');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar este tipo de Easyvista?')) return;
    const toastId = toast.loading('A eliminar tipo...');
    try {
      const { error } = await supabase
        .from('easyvista_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess('Tipo de Easyvista eliminado com sucesso!');
      fetchEasyvistaTypes();
    } catch (error: any) {
      console.error('Error deleting Easyvista type:', error);
      showError(`Erro ao eliminar tipo de Easyvista: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> A carregar tipos de Easyvista...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Tipos de Easyvista</h2>
          <Button variant="outline" onClick={fetchEasyvistaTypes}>
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingType ? 'Editar Tipo de Easyvista' : 'Adicionar Novo Tipo de Easyvista'}</CardTitle>
            <CardDescription>Defina os tipos de Easyvista e os campos a serem exibidos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="typeName">Nome do Tipo</Label>
              <Input
                id="typeName"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Ex: Report Mensal, Pedido de Integração"
                disabled={submitting}
              />
            </div>
            <div>
              <Label htmlFor="displayFields">Campos a Exibir (separados por vírgula)</Label>
              <Input
                id="displayFields"
                value={displayFieldsInput}
                onChange={(e) => setDisplayFieldsInput(e.target.value)}
                placeholder="Ex: Titulo, Descrição, Status"
                disabled={submitting}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Liste os nomes das colunas da tabela Easyvistas que deseja exibir para este tipo.
              </p>
            </div>
            <Button onClick={handleCreateOrUpdate} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {editingType ? 'Atualizar Tipo' : 'Adicionar Tipo'}
            </Button>
            {editingType && (
              <Button variant="outline" onClick={() => { setEditingType(null); setNewTypeName(''); setDisplayFieldsInput(''); }} className="ml-2">
                Cancelar Edição
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Easyvista Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Tipo</TableHead>
                    <TableHead>Campos Exibidos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {easyvistaTypes.length > 0 ? (
                    easyvistaTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.display_fields?.join(', ') || 'Nenhum'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(type)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Nenhum tipo de Easyvista encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}