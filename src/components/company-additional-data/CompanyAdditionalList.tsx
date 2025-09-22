"use client";

import React from 'react';
import { CompanyAdditionalExcelData } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CompanyAdditionalListProps {
  companies: CompanyAdditionalExcelData[];
  onSelectCompany: (companyId: string) => void;
  selectedCompanyId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CompanyAdditionalList: React.FC<CompanyAdditionalListProps> = ({
  companies,
  onSelectCompany,
  selectedCompanyId,
  searchTerm,
  onSearchChange,
}) => {
  const filteredCompanies = React.useMemo(() => {
    if (!searchTerm) {
      return companies;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return companies.filter(company =>
      company["Nome Comercial"]?.toLowerCase().includes(lowercasedSearchTerm) ||
      company.excel_company_id.toLowerCase().includes(lowercasedSearchTerm) ||
      company["Email da empresa"]?.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [companies, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Pesquisar empresas adicionais..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {filteredCompanies.length === 0 ? (
            <p className="text-muted-foreground text-center">Nenhuma empresa encontrada.</p>
          ) : (
            filteredCompanies.map((company) => (
              <Card
                key={company.id || company.excel_company_id}
                className={`cursor-pointer transition-colors ${
                  selectedCompanyId === company.excel_company_id ? 'border-primary bg-accent' : 'hover:bg-muted'
                }`}
                onClick={() => onSelectCompany(company.excel_company_id)}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base">{company["Nome Comercial"] || company.excel_company_id}</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 text-sm text-muted-foreground">
                  ID Excel: {company.excel_company_id}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CompanyAdditionalList;