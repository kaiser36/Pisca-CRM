"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Building, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { fetchCompaniesMissingAdditionalData } from '@/integrations/supabase/utils';
import { Company } from '@/types/crm';

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
    const loadMissingCompanies = async () => {
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
      loadMissingCompanies();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Empresas sem Dados Adicionais</CardTitle>
          <CardDescription>A carregar a lista de empresas...</CardDescription>
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
      <Card className="w-full">
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Empresas sem Dados Adicionais ({companies.length})</CardTitle>
        <CardDescription>
          Estas empresas estão no seu CRM principal, mas não têm dados adicionais carregados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <div className="flex items-center text-muted-foreground">
            <Info className="mr-2 h-4 w-4" />
            <span>Todas as empresas têm dados adicionais!</span>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {companies.map((company) => (
                <div key={company.Company_id} className="flex items-center p-3 border rounded-md hover:bg-muted">
                  <Building className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{company.Company_Name}</p>
                    <p className="text-sm text-muted-foreground">ID Excel: {company.Company_id}</p>
                  </div>
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