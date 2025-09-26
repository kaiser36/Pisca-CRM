"use client";

import CompanyOverviewDashboard from "@/components/dashboard/CompanyOverviewDashboard";
import { Layout } from "@/components/layout/Layout"; // Corrigido para importação nomeada
import { showSuccess } from "@/utils/toast";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    // Exemplo de uso de toast, pode ser removido se não for necessário
    // showSuccess("Bem-vindo de volta!");
  }, []);

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <CompanyOverviewDashboard />
      </div>
    </Layout>
  );
}