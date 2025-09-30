"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, DollarSign, TrendingUp } from 'lucide-react';
import { CompanyAdditionalExcelData } from '@/types/crm';

interface CompanyAdditionalOverviewCardsProps {
  additionalData: CompanyAdditionalExcelData | null;
}

const CompanyAdditionalOverviewCards: React.FC<CompanyAdditionalOverviewCardsProps> = ({ additionalData }) => {
  if (!additionalData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-4 animate-pulse bg-gray-200 rounded-lg">
            <div className="h-6 w-3/4 mb-3 bg-gray-300 rounded"></div>
            <div className="h-8 w-1/2 mb-2 bg-gray-300 rounded"></div>
            <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const piscaData = {
    totalAnuncios: additionalData['Stock na empresa'] || 0,
    publicados: additionalData['Stock STV'] || 0,
    api: additionalData['API'] === 'Sim' ? 'Sim' : 'Não',
  };

  const crmData = {
    utilizaCRM: additionalData['Utiliza CRM'] ? 'Sim' : 'Não',
    qualCRM: additionalData['Qual o CRM'] || 'N/A',
  };

  const investmentData = {
    socialMedia: additionalData['Investimento redes sociais'] || 0,
    portals: additionalData['Investimento em portais'] || 0,
  };

  const businessData = {
    classification: additionalData['Classificação'] || 'N/A',
    b2b: additionalData['Mercado b2b'] ? 'Sim' : 'Não',
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Pisca Card */}
      <Card className="rounded-xl shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6">
        <CardHeader className="p-0 flex-row items-center space-y-0 mb-4">
          <div className="bg-white/20 p-3 rounded-lg mr-4">
            <Package className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold">
            Pisca
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-4xl font-extrabold">{piscaData.totalAnuncios}</div>
          <p className="text-sm text-white/80">Total de Anúncios</p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/80 text-xs">Publicados</p>
              <p className="font-semibold text-lg">{piscaData.publicados}</p>
            </div>
            <div>
              <p className="text-white/80 text-xs">Via API</p>
              <p className="font-semibold text-lg">{piscaData.api}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CRM Card */}
      <Card className="p-6 shadow-sm rounded-xl">
        <CardHeader className="p-0 flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            CRM
          </CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">{crmData.utilizaCRM}</div>
          <p className="text-xs text-muted-foreground">
            {crmData.qualCRM}
          </p>
        </CardContent>
      </Card>

      {/* Investment Card */}
      <Card className="p-6 shadow-sm rounded-xl">
        <CardHeader className="p-0 flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Investimento
          </CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">€{investmentData.socialMedia + investmentData.portals}</div>
          <p className="text-xs text-muted-foreground">
            €{investmentData.socialMedia} (Social) + €{investmentData.portals} (Portais)
          </p>
        </CardContent>
      </Card>

      {/* Business Card */}
      <Card className="p-6 shadow-sm rounded-xl">
        <CardHeader className="p-0 flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Negócio
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">{businessData.classification}</div>
          <p className="text-xs text-muted-foreground">
            Mercado B2B: {businessData.b2b}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyAdditionalOverviewCards;