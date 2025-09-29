"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  className?: string;
  formula?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, icon, className, formula }) => {
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
          {description && <p className="text-xs opacity-90">{description}</p>}
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

export default DashboardCard;