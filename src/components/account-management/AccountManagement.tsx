"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/integrations/supabase/auth';
import { fetchDistinctAccountRoles, fetchAccounts, insertAccount, updateAccount, deleteAccount } from '@/integrations/supabase/services/accountManagementService';
import { Account } from '@/types/crm';
import { toast } from 'react-hot-toast';
import { showSuccess, showError } from '@/utils/toast';

export function AccountManagement() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [distinctRoles, setDistinctRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Partial<Account>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadAccountsAndRoles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fetchedAccounts = await fetchAccounts(user.id);
      setAccounts(fetchedAccounts);
      const fetchedRoles = await fetchDistinctAccountRoles();
      setDistinctRoles(fetchedRoles);
    } catch (error: any) {
      console.error('Error loading accounts or roles:', error);
      showError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAccountsAndRoles();
  }, [loadAccountsAndRoles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData(account);
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('Utilizador não autenticado.');
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading(editingAccount ? 'A atualizar conta...' : 'A criar conta...');

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
        showSuccess('Conta atualizada com sucesso!');
      } else {
        await insertAccount({ ...formData, user_id: user.id } as Omit<Account, 'id' | 'created_at'>);
        showSuccess('Conta criada com sucesso!');
      }
      handleCancelEdit();
      loadAccountsAndRoles();
    } catch (error: any) {
      console.error('Error saving account:', error);
      showError(`Erro ao guardar conta: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta conta?')) return;
    setSubmitting(true);
    const toastId = toast.loading('A eliminar conta...');
    try {
      await deleteAccount(id);
      showSuccess('Conta eliminada com sucesso!');
      loadAccountsAndRoles();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      showError(`Erro ao eliminar conta: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
      setSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> A carregar contas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingAccount ? 'Editar Conta' : 'Adicionar Nova Conta'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account_name" className="block text-sm font-medium text-gray-700">Nome da Conta</label>
              <Input
                id="account_name"
                name="account_name"
                value={formData.account_name || ''}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Telefone</label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Função</label>
              <Select
                name="role"
                value={formData.role || ''}
                onValueChange={(value) => handleSelectChange('role', value)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar função" />
                </SelectTrigger>
                <SelectContent>
                  {distinctRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                  {/* Opção para adicionar uma nova função se não estiver na lista */}
                  {!distinctRoles.includes(formData.role || '') && formData.role && (
                    <SelectItem value={formData.role}>{formData.role} (Nova)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              {editingAccount && (
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={submitting}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                {editingAccount ? 'Atualizar Conta' : 'Adicionar Conta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Pesquisar contas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={loadAccountsAndRoles}>
              <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Conta</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.account_name}</TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>{account.phone_number}</TableCell>
                      <TableCell>{account.role}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(account)} disabled={submitting}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)} disabled={submitting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma conta encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}