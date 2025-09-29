"use client";

import React, { useState, useMemo } from 'react';
import { Analytics } from '@/types/crm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ConversionConfigurator from './ConversionConfigurator';
import { cn } from '@/lib/utils';

interface AnalyticsComparisonDashboardProps {
  analytics: Analytics[];
}

const AnalyticsComparisonDashboard: React.FC<AnalyticsComparisonDashboardProps> = ({ analytics }) => {
  const [conversionPercentages, setConversionPercentages] = useState({ phone: 100, whatsapp: 100 });

  const calculateMetricsForAnalytic = (analytic: Analytics) => {
    const views = Number(analytic.views) || 0;
    const clicks = Number(analytic.clicks) || 0;
    const phone_views = Number(analytic.phone_views) || 0;
    const whatsapp_interactions = Number(analytic.whatsapp_interactions) || 0;
    const leads_email = Number(analytic.leads_email) || 0;
    const total_cost = Number(analytic.total_cost) || 0;
    const revenue = Number(analytic.revenue) || 0;

    const adjustedPhoneLeads = phone_views * (conversionPercentages.phone / 100);
    const adjustedWhatsappLeads = whatsapp_interactions * (conversionPercentages.whatsapp / 100);
    const totalLeads = leads_email + adjustedPhoneLeads + adjustedWhatsappLeads;

    const cpl = totalLeads > 0 ? total_cost / totalLeads : 0;
    const roi = total_cost > 0 ? ((revenue - total_cost) / total_cost) * 100 : 0;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;

    return {
      roi,
      totalLeads,
      cpl,
      ctr,
      total_cost,
      revenue,
      views,
      clicks,
    };
  };

  const comparisonData = useMemo(() => {
    return analytics.map(analytic => ({
      id: analytic.id!,
      title: analytic.title,
      metrics: calculateMetricsForAnalytic(analytic),
    }));
  }, [analytics, conversionPercentages]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatNumber = (value: number, decimals = 0) => value.toFixed(decimals);

  const kpiRows = [
    { key: 'roi', name: 'ROI (Retorno)', higherIsBetter: true, format: formatPercentage },
    { key: 'totalLeads', name: 'Total de Leads', higherIsBetter: true, format: (v: number) => formatNumber(v) },
    { key: 'cpl', name: 'CPL (Custo por Lead)', higherIsBetter: false, format: formatCurrency },
    { key: 'ctr', name: 'CTR (Taxa de Cliques)', higherIsBetter: true, format: formatPercentage },
    { key: 'revenue', name: 'Receita', higherIsBetter: true, format: formatCurrency },
    { key: 'total_cost', name: 'Custo Total', higherIsBetter: false, format: formatCurrency },
    { key: 'views', name: 'Visualizações', higherIsBetter: true, format: (v: number) => formatNumber(v) },
    { key: 'clicks', name: 'Cliques', higherIsBetter: true, format: (v: number) => formatNumber(v) },
  ];

  const getBestValue = (key: keyof ReturnType<typeof calculateMetricsForAnalytic>, higherIsBetter: boolean) => {
    const values = comparisonData.map(d => d.metrics[key]);
    if (values.length === 0) return null;
    return higherIsBetter ? Math.max(...values) : Math.min(...values.filter(v => v > 0));
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Comparação de Análises de Campanhas</CardTitle>
        <CardDescription>Compare os KPIs de múltiplas campanhas para identificar as mais eficazes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ConversionConfigurator onConfigChange={setConversionPercentages} />
        <div className="mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Métrica</TableHead>
                {comparisonData.map(data => (
                  <TableHead key={data.id} className="text-center font-semibold">{data.title}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpiRows.map(kpi => {
                const bestValue = getBestValue(kpi.key as any, kpi.higherIsBetter);
                return (
                  <TableRow key={kpi.key}>
                    <TableCell className="font-medium">{kpi.name}</TableCell>
                    {comparisonData.map(data => {
                      const value = data.metrics[kpi.key as keyof typeof data.metrics];
                      const isBest = value === bestValue && comparisonData.length > 1;
                      return (
                        <TableCell key={data.id} className={cn("text-center", isBest && "bg-green-100 dark:bg-green-900/50 rounded-md")}>
                          <div className={cn("font-bold", isBest ? "text-green-600 dark:text-green-400" : "")}>
                            {kpi.format(value)}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsComparisonDashboard;