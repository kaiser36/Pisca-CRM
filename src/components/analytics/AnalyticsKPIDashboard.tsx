"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Analytics } from '@/types/crm';
import {
  Award,
  DollarSign,
  Eye,
  Handshake,
  LineChart,
  MousePointerClick,
  Percent,
  Rocket,
  Target,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardCard from '@/components/dashboard/DashboardCard';

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  formula?: string;
  icon: React.ReactNode;
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, formula, icon, className }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-5 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl text-white",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
          <p className="text-xs opacity-90">{description}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-lg">
          {icon}
        </div>
      </div>
      {formula && (
        <p className="mt-3 text-xs italic opacity-70">Fórmula: {formula}</p>
      )}
    </div>
  );
};

interface AnalyticsKPIDashboardProps {
  analytic: Analytics;
}

const AnalyticsKPIDashboard: React.FC<AnalyticsKPIDashboardProps> = ({ analytic }) => {
  const calculatedMetrics = useMemo(() => {
    // Converter todos os valores para números e tratar nulos/undefined
    const views = Number(analytic.views) || 0;
    const clicks = Number(analytic.clicks) || 0;
    const phone_views = Number(analytic.phone_views) || 0;
    const whatsapp_interactions = Number(analytic.whatsapp_interactions) || 0;
    const leads_email = Number(analytic.leads_email) || 0;
    const location_clicks = Number(analytic.location_clicks) || 0;
    const total_ads = Number(analytic.total_ads) || 0;
    const total_cost = Number(analytic.total_cost) || 0;
    const revenue = Number(analytic.revenue) || 0;

    const totalLeads = phone_views + whatsapp_interactions + leads_email;
    const totalInteractions = clicks + whatsapp_interactions + phone_views + leads_email + location_clicks;

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
      totalInteractions,
      views,
      clicks,
      total_ads,
      cpl,
      cpm,
      cpc,
      cpa,
      roi,
      ctr,
      custoPorAnuncio,
      performancePorAnuncio,
      adEfficiencyScore,
      total_cost,
      revenue
    };
  }, [analytic]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatNumber = (value: number, decimals = 2) => value.toFixed(decimals);

  const kpiData = [
    {
      title: 'ROI (Retorno Investimento)',
      value: formatPercentage(calculatedMetrics.roi),
      description: `De ${formatCurrency(analytic.revenue || 0)} de receita`,
      formula: '((Receita - Custo) / Custo) * 100',
      icon: <LineChart className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-green-500 to-emerald-500',
    },
    {
      title: 'Total de Leads',
      value: formatNumber(calculatedMetrics.totalLeads, 0),
      description: `De ${calculatedMetrics.totalInteractions} interações`,
      formula: 'Chamadas + WhatsApp + Emails',
      icon: <Users className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-blue-500 to-sky-500',
    },
    {
      title: 'CPL (Custo por Lead)',
      value: formatCurrency(calculatedMetrics.cpl),
      description: `Baseado em ${calculatedMetrics.totalLeads} leads`,
      formula: 'Custo Total / Total de Leads',
      icon: <Target className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-orange-500 to-amber-500',
    },
    {
      title: 'CTR (Taxa de Cliques)',
      value: formatPercentage(calculatedMetrics.ctr),
      description: `De ${calculatedMetrics.views} visualizações`,
      formula: '(Cliques / Visualizações) * 100',
      icon: <Percent className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-purple-500 to-violet-500',
    },
    {
      title: 'CPC (Custo por Clique)',
      value: formatCurrency(calculatedMetrics.cpc),
      description: `Para ${calculatedMetrics.clicks} cliques`,
      formula: 'Custo Total / Cliques',
      icon: <MousePointerClick className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-rose-500 to-pink-500',
    },
    {
      title: 'CPA (Custo por Interação)',
      value: formatCurrency(calculatedMetrics.cpa),
      description: `Para ${calculatedMetrics.totalInteractions} interações`,
      formula: 'Custo Total / Total de Interações',
      icon: <Handshake className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    },
    {
      title: 'CPM (Custo por Mil)',
      value: formatCurrency(calculatedMetrics.cpm),
      description: `Para ${calculatedMetrics.views} visualizações`,
      formula: '(Custo Total / Visualizações) * 1000',
      icon: <Eye className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    },
    {
      title: 'Custo por Anúncio',
      value: formatCurrency(calculatedMetrics.custoPorAnuncio),
      description: `Média de ${calculatedMetrics.total_ads} anúncios`,
      formula: 'Custo Total / Total de Anúncios',
      icon: <DollarSign className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-slate-600 to-gray-700',
    },
    {
      title: 'Performance por Anúncio',
      value: formatNumber(calculatedMetrics.performancePorAnuncio),
      description: 'Leads gerados por anúncio',
      formula: 'Total de Leads / Total de Anúncios',
      icon: <Rocket className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-yellow-500 to-amber-400',
    },
    {
      title: 'Ad Efficiency Score',
      value: formatCurrency(calculatedMetrics.adEfficiencyScore),
      description: 'Receita gerada por anúncio',
      formula: 'Receita / Total de Anúncios',
      icon: <Award className="w-7 h-7" />,
      className: 'bg-gradient-to-br from-red-500 to-orange-500',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard KPIs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {kpiData.map((kpi) => (
          <DashboardCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            description={kpi.description}
            formula={kpi.formula}
            icon={kpi.icon}
            className={kpi.className}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalyticsKPIDashboard;