"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Analytics } from '@/types/crm';

interface AnalyticsKPIDashboardProps {
  analytic: Analytics;
}

const AnalyticsKPIDashboard: React.FC<AnalyticsKPIDashboardProps> = ({ analytic }) => {
  const calculatedMetrics = useMemo(() => {
    const { views = 0, clicks = 0, phone_views = 0, whatsapp_interactions = 0, leads_email = 0, location_clicks = 0, total_ads = 0, total_cost = 0, revenue = 0 } = analytic;

    const totalLeads = (phone_views || 0) + (whatsapp_interactions || 0) + (leads_email || 0);
    const totalInteractions = (clicks || 0) + (whatsapp_interactions || 0) + (phone_views || 0) + (leads_email || 0) + (location_clicks || 0);

    const cpl = totalLeads > 0 ? total_cost / totalLeads : 0;
    const cpm = views > 0 ? (total_cost / views) * 1000 : 0;
    const cpc = clicks > 0 ? total_cost / clicks : 0;
    const cpa = totalInteractions > 0 ? total_cost / totalInteractions : 0;
    const roi = total_cost > 0 ? ((revenue - total_cost) / total_cost) * 100 : 0;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    const custoPorAnuncio = total_ads > 0 ? total_cost / total_ads : 0;
    const performancePorAnuncio = total_ads > 0 ? totalLeads / total_ads : 0;
    const adEfficiencyScore = total_ads > 0 ? revenue / total_ads : 0;

    return {
      totalLeads,
      cpl,
      cpm,
      cpc,
      cpa,
      roi,
      ctr,
      custoPorAnuncio,
      performancePorAnuncio,
      adEfficiencyScore,
    };
  }, [analytic]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatNumber = (value: number) => value.toFixed(2);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dashboard KPIs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {calculatedMetrics.totalLeads}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">CPL (Custo por Lead)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatCurrency(calculatedMetrics.cpl)}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">CPM (Custo por Mil)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatCurrency(calculatedMetrics.cpm)}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">CPC (Custo por Clique)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatCurrency(calculatedMetrics.cpc)}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">CPA (Custo por Interação)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatCurrency(calculatedMetrics.cpa)}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI (Retorno Investimento)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatPercentage(calculatedMetrics.roi)}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR (Taxa de Cliques)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatPercentage(calculatedMetrics.ctr)}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo por Anúncio</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatCurrency(calculatedMetrics.custoPorAnuncio)}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance por Anúncio</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatNumber(calculatedMetrics.performancePorAnuncio)}
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Efficiency Score</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl font-bold">
            {formatNumber(calculatedMetrics.adEfficiencyScore)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsKPIDashboard;