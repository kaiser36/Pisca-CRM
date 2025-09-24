import React from 'react';
import { Company } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyListProps {
  companies: Company[];
  onSelectCompany: (companyId: string) => void;
  selectedCompanyId: string | null;
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, onSelectCompany, selectedCompanyId }) => {
  return (
    <ScrollArea className="h-full w-full pr-4">
      <div className="space-y-3"> {/* Adjusted spacing */}
        {companies.map((company) => (
          <Card
            key={company.Company_id}
            className={`cursor-pointer transition-all duration-200 ease-in-out ${
              selectedCompanyId === company.Company_id
                ? 'border-primary bg-primary/10 shadow-md' // Stronger selected state
                : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50' // Subtle hover
            }`}
            onClick={() => onSelectCompany(company.Company_id)}
          >
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base font-semibold">{company.Company_Name}</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4 text-sm text-muted-foreground">
              {company.stands.length} {company.stands.length === 1 ? 'Stand' : 'Stands'}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CompanyList;