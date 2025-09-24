"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Building, Mail, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { fetchCompaniesMissingAdditionalData } from '@/integrations/supabase/utils';
import { Company } from '@/types/crm';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MissingAdditionalDataList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
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
    const loadMissingData = async () => {
      if (!userId) {
        setIsLoading(false);
        setError("Utilizador não autenticado. Por favor, faça login para ver esta lista.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCompaniesMissingAdditionalData(userId);
        setCompanies(data);
      } catch (err: any) {
        console.error("Erro ao carregar empresas sem dados adicionais:", err);
        setError(err.message || "Falha ao carregar a lista de empresas sem dados adicionais.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadMissingData();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Empresas sem Dados Adicionais</CardTitle>
          <CardDescription>A carregar...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Empresas sem Dados Adicionais</CardTitle>
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

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <Info className="mr-2 h-5 w-5 text-blue-500" />
          Empresas sem Dados Adicionais ({companies.length})
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Estas empresas existem no seu CRM principal, mas não têm dados adicionais carregados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Todas as empresas do CRM têm dados adicionais.</p>
        ) : (
          <ScrollArea className="h-[300px] w-full pr-4">
            <div className="space-y-3">
              {companies.map((company) => (
                <div key={company.Company_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors shadow-sm">
                  <div>
                    <p className="font-medium flex items-center text-foreground">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      {company.Company_Name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Mail className="mr-2 h-4 w-4" />
                      {company.Company_Email}
                    </p>
                  </div>
                  <Link to={`/company-additional-data?companyId=${company.Company_id}`} className="mt-2 sm:mt-0">
                    <Button variant="outline" size="sm">
                      Adicionar Dados
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default MissingAdditionalDataList;