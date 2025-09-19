"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CompanyFilterProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Pesquisar empresas..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};

export default CompanyFilter;