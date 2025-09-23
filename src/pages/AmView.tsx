"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAccounts } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { Account } from '@/types/crm';
import AccountTable from '@/components/am/AccountTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AccountCreateForm from '@/components/am/AccountCreateForm';

const AmView: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const loadAccounts = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setError("Utilizador não autenticado. Por favor, faça login para ver os dados dos AMs.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAccounts(userId);
      setAccounts(data);
    } catch (err: any) {
      console.error("Erro ao carregar contas de AM:", err);
      setError(err.message || "Falha ao carregar os dados das contas de AM.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadAccounts();
    }
  }, [userId, loadAccounts]);

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Gestão de AMs</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Conta de AM</DialogTitle>
              </DialogHeader>
              <AccountCreateForm
                onSave={() => {
                  setIsCreateDialogOpen(false);
                  loadAccounts();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <AccountTable accounts={accounts} isLoading={isLoading} error={error} onAccountChanged={loadAccounts} />
        </div>
      </div>
    </Layout>
  );
};

export default AmView;