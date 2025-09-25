"use client";

import React, { useState } from 'react';
import { Campaign } from '@/types/crm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Tag, Percent, DollarSign, Calendar, CheckCircle, XCircle, Edit, Trash, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import CampaignEditForm from './CampaignEditForm';
import { deleteCampaign } from '@/integrations/supabase/utils';
import { showError, showSuccess } from '@/utils/toast';
import { format, isPast, isFuture, parseISO } from 'date-fns'; // Importar parseISO
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CampaignTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  onCampaignChanged: () => void; // Callback to refresh data
}

const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, isLoading, error, onCampaignChanged }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const handleDelete = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId);
      showSuccess("Campanha eliminada com sucesso!");
      onCampaignChanged();
    } catch (err: any) {
      console.error("Erro ao eliminar campanha:", err);
      showError(err.message || "Falha ao eliminar a campanha.");
    }
  };

  const getCampaignStatus = (campaign: Campaign) => {
    if (!campaign.is_active) return { text: "Inativa", variant: "destructive" as const };
    if (campaign.start_date && isFuture(parseISO(campaign.start_date))) return { text: "Agendada", variant: "secondary" as const };
    if (campaign.end_date && isPast(parseISO(campaign.end_date))) return { text: "Expirada", variant: "destructive" as const };
    return { text: "Ativa", variant: "default" as const };
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>A carregar dados das campanhas...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>Nenhuma campanha encontrada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Não há dados de campanhas para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Lista de Campanhas</CardTitle>
        <CardDescription className="text-muted-foreground">Gerencie as campanhas de descontos e ofertas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Nome</TableHead>
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead className="w-[150px]">Desconto</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const status = getCampaignStatus(campaign);
                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium flex items-center py-3">
                      <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                      {campaign.name}
                    </TableCell>
                    <TableCell className="py-3 capitalize">{campaign.type}</TableCell>
                    <TableCell className="py-3">
                      {campaign.type === 'discount' && campaign.discount_type !== 'none' ? (
                        <span className="flex items-center">
                          {campaign.discount_type === 'percentage' ? (
                            <Percent className="mr-1 h-4 w-4 text-muted-foreground" />
                          ) : (
                            <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                          )}
                          {campaign.discount_value?.toFixed(2)}{campaign.discount_type === 'percentage' ? '%' : ' €'}
                        </span>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="py-3 text-sm">
                      {campaign.start_date && campaign.end_date ? (
                        <span className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {format(parseISO(campaign.start_date), 'dd/MM/yyyy')} - {format(parseISO(campaign.end_date), 'dd/MM/yyyy')}
                        </span>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isto irá eliminar permanentemente a campanha "{campaign.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => campaign.id && handleDelete(campaign.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {selectedCampaign && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Campanha</DialogTitle>
            </DialogHeader>
            <CampaignEditForm
              campaign={selectedCampaign}
              onSave={() => {
                setIsEditDialogOpen(false);
                onCampaignChanged();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default CampaignTable;