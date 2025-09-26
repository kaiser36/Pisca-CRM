"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout'; // Corrigido para importação nomeada
import { fetchCampaigns } from '@/integrations/supabase/utils'; // Assuming this utility exists
import { useAuth } from '@/integrations/supabase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Campaign } from '@/types/crm'; // Assuming Campaign type is defined
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { showSuccess, showError } from '@/utils/toast';

export default function Campaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCampaigns = useCallback(async () => {
    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setCampaigns(data || []);
    } catch (err: any) {
      console.error('Failed to fetch campaigns:', err);
      setError(err.message || 'Failed to load campaigns.');
      showError('Erro ao carregar campanhas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta campanha?')) return;
    const toastId = toast.loading('A eliminar campanha...');
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      showSuccess('Campanha eliminada com sucesso!');
      loadCampaigns();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      showError(`Erro ao eliminar campanha: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" /> A carregar campanhas...
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
          <h2 className="text-3xl font-bold tracking-tight">Campanhas</h2>
          <div className="flex items-center space-x-2">
            <Link to="/campaigns/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Campanha
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Campanhas</CardTitle>
            <CardDescription>Gerencie as suas campanhas de marketing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Pesquisar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={loadCampaigns}>
                <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Ativa</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.type}</TableCell>
                        <TableCell>{campaign.discount_value} {campaign.discount_type === 'percentage' ? '%' : '€'}</TableCell>
                        <TableCell>{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{campaign.is_active ? 'Sim' : 'Não'}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/campaigns/${campaign.id}`}>
                            <Button variant="ghost" size="icon" className="mr-2">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhuma campanha encontrada.
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