"use client";

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area'; // Keep ScrollArea for now
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Keep shadcn/ui Alert for now
import { Terminal, Building, Mail, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Keep Skeleton for now
import { supabase } from '@/integrations/supabase/client';
import { fetchCompaniesMissingAdditionalData } from '@/integrations/supabase/utils';
import { Company } from '@/types/crm';
import { Link } from 'react-router-dom';

import MuiCard from '@mui/material/Card'; // Import MUI Card
import MuiCardContent from '@mui/material/CardContent'; // Import MUI CardContent
import MuiCardHeader from '@mui/material/CardHeader'; // Import MUI CardHeader
import Typography from '@mui/material/Typography'; // Import MUI Typography
import Box from '@mui/material/Box'; // Import MUI Box for layout
import MuiButton from '@mui/material/Button'; // Import MUI Button

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
      <MuiCard sx={{ width: '100%', boxShadow: 1 }}>
        <MuiCardHeader
          title={<Typography variant="h6" component="div">Empresas sem Dados Adicionais</Typography>}
          subheader={<Typography variant="body2" color="text.secondary">A carregar...</Typography>}
        />
        <MuiCardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </MuiCardContent>
      </MuiCard>
    );
  }

  if (error) {
    return (
      <MuiCard sx={{ width: '100%', boxShadow: 1 }}>
        <MuiCardHeader
          title={<Typography variant="h6" component="div">Empresas sem Dados Adicionais</Typography>}
        />
        <MuiCardContent>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </MuiCardContent>
      </MuiCard>
    );
  }

  return (
    <MuiCard sx={{ width: '100%', boxShadow: 3 }}>
      <MuiCardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Info className="mr-2 h-5 w-5 text-blue-500" />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'semibold' }}>Empresas sem Dados Adicionais ({companies.length})</Typography>
          </Box>
        }
        subheader="Estas empresas existem no seu CRM principal, mas não têm dados adicionais carregados."
        subheaderTypographyProps={{ color: 'text.secondary' }}
        sx={{ pb: 1.5 }}
      />
      <MuiCardContent sx={{ pt: 0 }}>
        {companies.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Todas as empresas do CRM têm dados adicionais.</Typography>
        ) : (
          <ScrollArea className="h-[300px] w-full pr-4">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {companies.map((company) => (
                <Box
                  key={company.Company_id}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.3s, box-shadow 0.3s',
                    boxShadow: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      {company.Company_Name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Mail className="mr-2 h-4 w-4" />
                      {company.Company_Email}
                    </Typography>
                  </Box>
                  <Link to={`/company-additional-data?companyId=${company.Company_id}`} style={{ textDecoration: 'none', marginTop: { xs: 1, sm: 0 } }}>
                    <MuiButton variant="outlined" size="small">
                      Adicionar Dados
                    </MuiButton>
                  </Link>
                </Box>
              ))}
            </Box>
          </ScrollArea>
        )}
      </MuiCardContent>
    </MuiCard>
  );
};

export default MissingAdditionalDataList;