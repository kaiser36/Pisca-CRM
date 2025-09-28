"use client";

import React, { useMemo } from 'react';
import { Analytics } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Percent, TrendingUp, Users, Eye, MousePointerClick, ListTodo, Target, Zap, BarChart3 } from 'lucide-react'; // NEW: Import BarChart3
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AnalyticsDashboardProps {
  analyticsData: Analytics[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analyticsData }) => {
  const aggregatedData = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) {
      return {
        totalViews: 0,
        totalClicks: 0,
        totalPhoneViews: 0,
        totalWhatsappInteractions: 0,
        totalLeadsEmail: 0,
        totalLeads: 0,
        totalCost: 0,
        totalRevenue: 0,
        totalAds: 0,
        totalFavorites: 0,
        totalLocationClicks: 0,
      };
    }

    return analyticsData.reduce(
      (acc, curr) => {
        acc.totalViews += curr.views || 0;
        acc.totalClicks += curr.clicks || 0;
        acc.totalPhoneViews += curr.phone_views || 0;
        acc.totalWhatsappInteractions += curr.whatsapp_interactions || 0;
        acc.totalLeadsEmail += curr.leads_email || 0;
        acc.totalLeads += curr.total_leads || 0;
        acc.totalCost += curr.total_cost || 0;
        acc.totalRevenue += curr.revenue || 0;
        acc.totalAds += curr.total_ads || 0;
        acc.totalFavorites += curr.favorites || 0;
        acc.totalLocationClicks += curr.location_clicks || 0;
        return acc;
      },
      {
        totalViews: 0,
        totalClicks: 0,
        totalPhoneViews: 0,
        totalWhatsappInteractions: 0,
        totalLeadsEmail: 0,
        totalLeads: 0,
        totalCost: 0,
        totalRevenue: 0,
        totalAds: 0,
        totalFavorites: 0,
        totalLocationClicks: 0,
      }
    );
  }, [analyticsData]);

  const {
    totalViews,
    totalClicks,
    totalPhoneViews,
    totalWhatsappInteractions,
    totalLeadsEmail,
    totalLeads,
    totalCost,
    totalRevenue,
    totalAds,
    totalFavorites,
    totalLocationClicks,
  } = aggregatedData;

  // Calculate Metrics
  const CPL = totalLeads > 0 ? totalCost / totalLeads : 0;
  const CPM = totalViews > 0 ? (totalCost / totalViews) * 1000 : 0;
  const CPC = totalClicks > 0 ? totalCost / totalClicks : 0;
  const CPA = totalLeads > 0 ? totalCost / totalLeads : 0; // Assuming acquisition is a lead for now
  const ROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  const CTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

  const funnelData = [
    { name: 'Visualizações', value: totalViews, color: '#8884d8' },
    { name: 'Cliques', value: totalClicks, color: '#82ca9d' },
    { name: 'Leads (Tel.)', value: totalPhoneViews, color: '#ffc658' },
    { name: 'Leads (Whats.)', value: totalWhatsappInteractions, color: '#ff7300' },
    { name: 'Leads (Email)', value: totalLeadsEmail, color: '#a4de6c' },
    { name: 'Total Leads', value: totalLeads, color: '#d0ed57' },
  ];

  const renderMetricCard = (title: string, value: number | string, unit: string, icon: React.ElementType, isCurrency: boolean = false) => (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {React.createElement(icon, { className: "h-4 w-4 text-muted-foreground" })}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isCurrency ? (value as number).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }) : (value as number).toFixed(2)}
          {unit}
        </div>
      </CardContent>
    </Card>
  );

  if (analyticsData.length === 0) {
    return (
      <Card className="w-full shadow-sm mb-6">
        <CardHeader>
          <CardTitle>Dashboard de Análises de Campanha</CardTitle>
          <CardDescription>Nenhum dado de análise disponível para gerar o dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Por favor, adicione registos de análise para ver as métricas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-primary" /> Dashboard de Análises de Campanha
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Visão geral das métricas agregadas de todas as análises para esta empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {renderMetricCard("Custo Total", totalCost, " €", DollarSign, true)}
          {renderMetricCard("Receita Total", totalRevenue, " €", TrendingUp, true)}
          {renderMetricCard("Total de Visualizações", totalViews, "", Eye)}
          {renderMetricCard("Total de Cliques", totalClicks, "", MousePointerClick)}
          {renderMetricCard("Total de Leads", totalLeads, "", Users)}
          {renderMetricCard("CPL (Custo por Lead)", CPL, " €", Target, true)}
          {renderMetricCard("CPM (Custo por Mil Impressões)", CPM, " €", DollarSign, true)}
          {renderMetricCard("CPC (Custo por Clique)", CPC, " €", MousePointerClick, true)}
          {renderMetricCard("CTR (Click-Through Rate)", CTR, " %", Percent)}
          {renderMetricCard("ROI (Retorno sobre Investimento)", ROI, " %", Zap)}
        </div>

        <Separator />

        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ListTodo className="mr-2 h-5 w-5 text-primary" /> Funil de Conversão
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => value.toLocaleString('pt-PT')} />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;