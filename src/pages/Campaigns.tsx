"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { fetchCampaigns } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types/crm';
import CampaignTable from '@/components/campaigns/CampaignTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CampaignCreateForm from '@/components/campaigns/CampaignCreateForm';

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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

  const loadCampaigns = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setError("Utilizador não autenticado. Por favor, faça login para ver os dados das campanhas.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCampaigns(userId);
      setCampaigns(data);
    } catch (err: any) {
      console.error("Erro ao carregar campanhas:", err);
      setError(err.message || "Falha ao carregar os dados das campanhas.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadCampaigns();
    }
  }, [userId, loadCampaigns]);

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Gestão de Campanhas</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Campanha</DialogTitle>
              </DialogHeader>
              <CampaignCreateForm
                onSave={() => {
                  setIsCreateDialogOpen(false);
                  loadCampaigns();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <CampaignTable campaigns={campaigns} isLoading={isLoading} error={error} onCampaignChanged={loadCampaigns} />
        </div>
      </div>
    </Layout>
  );
};

export default Campaigns;