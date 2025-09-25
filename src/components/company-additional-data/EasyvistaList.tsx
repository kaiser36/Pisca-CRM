"use client";

import React, { useEffect, useState } from 'react';
import { Easyvista } from '@/types/crm';
import { fetchEasyvistasByCompanyExcelId } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, User, Mail, Tag, FileText, LinkIcon, DollarSign, Building, Clock, Info, ShieldCheck, Package, Repeat, TrendingUp, Banknote, Factory, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge'; // Import Badge component

interface EasyvistaListProps {
  companyExcelId: string;
}

const EasyvistaList: React.FC<EasyvistaListProps> = ({ companyExcelId }) => {
  const [easyvistas, setEasyvistas] = useState<Easyvista[]>([]);
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

  const loadEasyvistas = async () => {
    if (!userId) {
      setError("Utilizador não autenticado. Por favor, faça login para ver os Easyvistas.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEasyvistas = await fetchEasyvistasByCompanyExcelId(userId, companyExcelId);
      setEasyvistas(fetchedEasyvistas);
    } catch (err: any) {
      console.error("Erro ao carregar Easyvistas:", err);
      setError(err.message || "Falha ao carregar os registos Easyvista.");
      showError(err.message || "Falha ao carregar os registos Easyvista.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && companyExcelId) {
      loadEasyvistas();
    }
  }, [userId, companyExcelId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const getUrgencyBadgeVariant = (urgency: Easyvista['Urgência']) => {
    switch (urgency) {
      case 'Alto': return 'destructive'; // Red
      case 'Médio': return 'secondary'; // Blue/Grey
      case 'Baixo': return 'default'; // Green
      default: return 'outline'; // Default grey
    }
  };

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | string[] | null | undefined) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) || (typeof value === 'number' && value === 0 && !label.includes('Valor'))) return null;

    let displayValue: React.ReactNode = value;
    if (typeof value === 'boolean') {
      displayValue = value ? (
        <span className="flex items-center text-green-600">Sim</span>
      ) : (
        <span className="flex items-center text-red-600">Não</span>
      );
    } else if (label.includes('Data')) {
      try {
        displayValue = format(new Date(String(value)), 'dd/MM/yyyy HH:mm');
      } catch {
        displayValue = String(value);
      }
    } else if (label.includes('URL') || label.includes('Anexos')) {
      if (Array.isArray(value)) {
        displayValue = value.map((url, index) => (
          <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">
            {url}
          </a>
        ));
      } else {
        displayValue = (
          <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {String(value)}
          </a>
        );
      }
    } else if (typeof value === 'number') {
      displayValue = value.toLocaleString('pt-PT');
    } else if (label === 'Urgência' && typeof value === 'string') { // NEW: Handle Urgência with Badge
      displayValue = <Badge variant={getUrgencyBadgeVariant(value as Easyvista['Urgência'])}>{value}</Badge>;
    }

    return (
      <div className="flex items-center text-sm">
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}:</span> <span className="ml-1 text-foreground">{displayValue}</span>
      </div>
    );
  };

  return (
    <ScrollArea className="h-full w-full pr-4">
      <div className="space-y-4">
        {easyvistas.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum registo Easyvista encontrado para esta empresa.</p>
        ) : (
          easyvistas.map((easyvista) => (
            <Card key={easyvista.id} className="w-full shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">{easyvista["Titulo"] || 'Easyvista sem Título'}</CardTitle>
                <CardDescription className="text-muted-foreground">EV_ID: {easyvista["EV_ID"]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {renderField(Building, "Nome Comercial", easyvista["Nome comercial"])}
                  {renderField(Calendar, "Data Criação", easyvista["Data Criação"])}
                  {renderField(Tag, "Status", easyvista["Status"])}
                  {renderField(User, "Account", easyvista["Account"])}
                  {renderField(Clock, "Última Atualização", easyvista["Ultima actualização"])}
                  {renderField(Info, "Tipo de Report", easyvista["Tipo de report"])}
                  {renderField(ShieldCheck, "PV", easyvista["PV"])}
                  {renderField(Tag, "Tipo EVS", easyvista["Tipo EVS"])}
                  {renderField(Alert, "Urgência", easyvista["Urgência"])} {/* NEW: Render Urgência with color */}
                  {renderField(Mail, "Email Pisca", easyvista["Email Pisca"])}
                  {renderField(Info, "Pass Pisca", easyvista["Pass Pisca"])}
                  {renderField(Info, "Client ID", easyvista["Client ID"])}
                  {renderField(Info, "Client Secret", easyvista["Client Secret"])}
                  {renderField(Info, "Integração", easyvista["Integração"])}
                  {renderField(Building, "NIF da Empresa", easyvista["NIF da empresa"])}
                  {renderField(Tag, "Campanha", easyvista["Campanha"])}
                  {renderField(Calendar, "Duração do Acordo", easyvista["Duração do acordo"])}
                  {renderField(Package, "Plano do Acordo", easyvista["Plano do acordo"])}
                  {renderField(DollarSign, "Valor sem IVA", easyvista["Valor sem iva"])}
                  {renderField(Info, "ID Proposta", easyvista["ID_Proposta"])}
                  {renderField(User, "Account Armatis", easyvista["Account Armatis"])}
                </div>
                {easyvista["Descrição"] && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start text-sm">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      <span className="font-medium">Descrição:</span> <span className="ml-1 flex-1 text-foreground">{easyvista["Descrição"]}</span>
                    </div>
                  </>
                )}
                {easyvista["Anexos"] && easyvista["Anexos"].length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start text-sm">
                      <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      <span className="font-medium">Anexos:</span> <span className="ml-1 flex-1">{renderField(LinkIcon, "Anexos", easyvista["Anexos"])}</span>
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Criado em: {easyvista.created_at ? format(new Date(easyvista.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default EasyvistaList;