import React from 'react';
import { Company } from '@/types/crm';
import StandCard from './StandCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompanyDetailProps {
  company: Company | null;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company }) => {
  if (!company) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Selecione uma empresa para ver os detalhes.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full pr-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{company.Company_Name}</CardTitle>
          <CardDescription>ID da Empresa: {company.Company_id}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Pontos de Venda ({company.stands.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.stands.map((stand) => (
              <StandCard key={stand.Stand_ID} stand={stand} />
            ))}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default CompanyDetail;