import React from 'react';
import { Company } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area'; // Keep ScrollArea for now

import MuiCard from '@mui/material/Card'; // Import MUI Card
import MuiCardContent from '@mui/material/CardContent'; // Import MUI CardContent
import Typography from '@mui/material/Typography'; // Import MUI Typography
import Box from '@mui/material/Box'; // Import MUI Box for layout

interface CompanyListProps {
  companies: Company[];
  onSelectCompany: (companyId: string) => void;
  selectedCompanyId: string | null;
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, onSelectCompany, selectedCompanyId }) => {
  return (
    <ScrollArea className="h-full w-full pr-4">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}> {/* Adjusted spacing */}
        {companies.map((company) => (
          <MuiCard
            key={company.Company_id}
            onClick={() => onSelectCompany(company.Company_id)}
            sx={{
              cursor: 'pointer',
              transition: 'all 200ms ease-in-out',
              border: 1,
              borderColor: selectedCompanyId === company.Company_id ? 'primary.main' : 'transparent',
              bgcolor: selectedCompanyId === company.Company_id ? 'primary.light' : 'background.paper',
              boxShadow: selectedCompanyId === company.Company_id ? 3 : 1,
              '&:hover': {
                borderColor: selectedCompanyId === company.Company_id ? 'primary.dark' : 'grey.300',
                bgcolor: selectedCompanyId === company.Company_id ? 'primary.main' : 'action.hover',
                boxShadow: 3,
              },
            }}
          >
            <MuiCardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'semibold' }}>
                {company.Company_Name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {company.stands.length} {company.stands.length === 1 ? 'Stand' : 'Stands'}
              </Typography>
            </MuiCardContent>
          </MuiCard>
        ))}
      </Box>
    </ScrollArea>
  );
};

export default CompanyList;