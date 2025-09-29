"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, FileText, Handshake } from 'lucide-react';

interface CompanyAdditionalOverviewCardsProps {
  companyExcelId: string;
}

const CompanyAdditionalOverviewCards: React.FC<CompanyAdditionalOverviewCardsProps> = ({ companyExcelId }) => {
  const { user } = useSession();
  const [counts, setCounts] = useState({ pisca: 0, easyvistas: 0, negocios: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    console.log('CompanyAdditionalOverviewCards fetchCounts called with:', { companyExcelId, userId: user?.id });
    
    if (!user || !companyExcelId) {
      console.log('Missing user or companyExcelId, skipping fetch');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching counts for tables...');
      
      // Fetch Pisca data
      const piscaPromise = supabase
        .from('company_additional_excel_data')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('excel_company_id', companyExcelId);

      // Fetch Easyvistas data
      const easyvistasPromise = supabase
        .from('Easyvistas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('company_excel_id', companyExcelId);

      // Fetch Negocios data
      const negociosPromise = supabase
        .from('negocios')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('company_excel_id', companyExcelId);

      const [piscaRes, easyvistasRes, negociosRes] = await Promise.all([
        piscaPromise,
        easyvistasPromise,
        negociosPromise,
      ]);

      console.log('API responses:', {
        pisca: { count: piscaRes.count, error: piscaRes.error },
        easyvistas: { count: easyvistasRes.count, error: easyvistasRes.error },
        negocios: { count: negociosRes.count, error: negociosRes.error },
      });

      if (piscaRes.error) {
        console.error('Pisca fetch error:', piscaRes.error);
        throw piscaRes.error;
      }
      if (easyvistasRes.error) {
        console.error('Easyvistas fetch error:', easyvistasRes.error);
        throw easyvistasRes.error;
      }
      if (negociosRes.error) {
        console.error('Negocios fetch error:', negociosRes.error);
        throw negociosRes.error;
      }

      const newCounts = {
        pisca: piscaRes.count ?? 0,
        easyvistas: easyvistasRes.count ?? 0,
        negocios: negociosRes.count ?? 0,
      };

      console.log('Setting counts:', newCounts);
      setCounts(newCounts);
    } catch (error: any) {
      console.error('Error in fetchCounts:', error);
      showError(`Erro ao carregar contagens: ${error.message}`);
      // Set counts to 0 on error
      setCounts({ pisca: 0, easyvistas: 0, negocios: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [user, companyExcelId]);

  useEffect(() => {
    console.log('CompanyAdditionalOverviewCards useEffect triggered', { companyExcelId, user: !!user });
    fetchCounts();
  }, [fetchCounts]);

  const cardData = [
    {
      title: 'Pisca',
      value: counts.pisca,
      icon: <Package className="h-7 w-7 text-white" />,
      description: 'Total de registos encontrados',
      gradient: 'from-blue-500 to-sky-500',
    },
    {
      title: 'Easyvistas',
      value: counts.easyvistas,
      icon: <FileText className="h-7 w-7 text-white" />,
      description: 'Total de tickets abertos',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Negócios',
      value: counts.negocios,
      icon: <Handshake className="h-7 w-7 text-white" />,
      description: 'Total de negócios registados',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  console.log('CompanyAdditionalOverviewCards rendering with counts:', counts, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[136px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cardData.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.gradient} text-white p-6 rounded-2xl shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl`}
        >
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-4 rounded-lg">
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium opacity-80">{card.title}</p>
              <p className="text-4xl font-bold">{card.value}</p>
            </div>
          </div>
          <p className="mt-4 text-xs opacity-70">{card.description}</p>
        </div>
      ))}
    </div>
  );
};

export default CompanyAdditionalOverviewCards;