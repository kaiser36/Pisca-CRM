"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout'; // Corrigido para importação nomeada
import { fetchAccounts } from '@/integrations/supabase/utils'; // Assuming this utility exists
import { useAuth } from '@/integrations/supabase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';
import { Account } from '@/types/crm'; // Assuming Account type is defined

export default function AmView() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAccounts = useCallback(async () => {
    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming fetchAccounts is updated to take user.id
      const fetchedAccounts = await fetchAccounts(user.id);
      setAccounts(fetchedAccounts);
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
      setError(err.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const filteredAccounts = accounts.filter(account =>
    account.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.am?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" /> A carregar contas...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] text-red-500">
          <RefreshCw className="h-6 w-6 mr-2" /> Erro: {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Visão Geral do AM</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Pesquisar por nome, AM ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={loadAccounts}>
                <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Conta</TableHead>
                    <TableHead>AM</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead>Função</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.account_name}</TableCell>
                        <TableCell>{account.am}</TableCell>
                        <TableCell>{account.email}</TableCell>
                        <TableCell>{account.phone_number}</TableCell>
                        <TableCell>{account.district}</TableCell>
                        <TableCell>{account.role}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
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
    </Layout>
  );
}