"use client";

import React from 'react';
import { Layout } from '@/components/layout/Layout'; // Corrigido para importação nomeada
import SettingsTabs from '@/components/settings/SettingsTabs';

export default function Settings() {
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <SettingsTabs />
      </div>
    </Layout>
  );
}