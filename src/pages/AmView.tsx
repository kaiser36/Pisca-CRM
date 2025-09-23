"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAccounts } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { Account } from '@/types/crm';
import AccountTable from '@/components/am/AccountTable'; // Import the new AccountTable component

const AmView: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
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

  useEffect(() => {
    const loadAccounts = async () => {
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
    };

    if (userId) {
      loadAccounts();
    }
  }, [userId]);

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestão de AMs</h1>
        <div className="grid grid-cols-1 gap-6">
          <AccountTable accounts={accounts} isLoading={isLoading} error={error} />
        </div>
      </div>
    </Layout>
  );
};

export default AmView;