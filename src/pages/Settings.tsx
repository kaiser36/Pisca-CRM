"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import SettingsTabs from '@/components/settings/SettingsTabs'; // New import

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Definições</h1>
        <SettingsTabs /> {/* Use the new SettingsTabs component here */}
      </div>
    </Layout>
  );
};

export default Settings;