"use client";

import React from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Package, ClipboardList, Banknote } from 'lucide-react';

interface CompanyAdditionalOverviewCardsProps {
  piscaData?: { totalAds?: number; plan?: string };
  easyvistasData?: { openTickets?: number; status?: string };
  credibomData?: { isPartner?: boolean; plafond?: number };
}

const CompanyAdditionalOverviewCards: React.FC<CompanyAdditionalOverviewCardsProps> = ({
  piscaData,
  easyvistasData,
  credibomData,
}) => {
  const formatCurrency = (value?: number) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Pisca Card */}
      <Card className="bg-gradient-to-br from-blue-500 to-sky-500 text-white rounded-lg shadow-lg p-4 flex flex-col">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-white">
          <Package className="mr-2 h-5 w-5" /> Pisca
        </CardTitle>
        <CardContent className="text-sm text-white/90 p-0 flex-grow">
          <p>Anúncios: <span className="font-bold">{piscaData?.totalAds ?? 'N/A'}</span></p>
          <p>Plano: <span className="font-bold">{piscaData?.plan ?? 'N/A'}</span></p>
        </CardContent>
      </Card>

      {/* Easyvistas Card */}
      <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white rounded-lg shadow-lg p-4 flex flex-col">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-white">
          <ClipboardList className="mr-2 h-5 w-5" /> Easyvistas
        </CardTitle>
        <CardContent className="text-sm text-white/90 p-0 flex-grow">
          <p>Tickets Abertos: <span className="font-bold">{easyvistasData?.openTickets ?? 'N/A'}</span></p>
          <p>Status: <span className="font-bold">{easyvistasData?.status ?? 'N/A'}</span></p>
        </CardContent>
      </Card>

      {/* Credibom Card */}
      <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-lg shadow-lg p-4 flex flex-col">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-white">
          <Banknote className="mr-2 h-5 w-5" /> Credibom
        </CardTitle>
        <CardContent className="text-sm text-white/90 p-0 flex-grow">
          <p>Parceiro: <span className="font-bold">{credibomData?.isPartner ? 'Sim' : 'Não'}</span></p>
          <p>Plafond: <span className="font-bold">{formatCurrency(credibomData?.plafond)}</span></p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyAdditionalOverviewCards;