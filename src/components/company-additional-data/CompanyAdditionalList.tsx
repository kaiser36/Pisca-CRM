"use client";

import React from 'react';
import { CompanyAdditionalExcelData } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area'; // Keep ScrollArea for now
import { Search, Loader2 } from 'lucide-react'; // Keep Lucide icons

import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress'; // MUI equivalent for Loader2

interface CompanyAdditionalListProps {
  companies: CompanyAdditionalExcelData[];
  onSelectCompany: (companyId: string) => void;
  selectedCompanyId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isSearching: boolean;
}

const CompanyAdditionalList: React.FC<CompanyAdditionalListProps> = ({
  companies,
  onSelectCompany,
  selectedCompanyId,
  searchTerm,
  onSearchChange,
  isSearching,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Pesquisar empresas adicionais..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search className="h-4 w-4 text-muted-foreground" />
            </InputAdornment>
          ),
          endAdornment: isSearching && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      <ScrollArea className="flex-1 pr-4">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {companies.length === 0 && !isSearching ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Nenhuma empresa encontrada.</Typography>
          ) : companies.length === 0 && isSearching ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>A pesquisar...</Typography>
          ) : (
            companies.map((company) => (
              <MuiCard
                key={company.id || company.excel_company_id}
                onClick={() => onSelectCompany(company.excel_company_id)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 200ms ease-in-out',
                  border: 1,
                  borderColor: selectedCompanyId === company.excel_company_id ? 'primary.main' : 'transparent',
                  bgcolor: selectedCompanyId === company.excel_company_id ? 'primary.light' : 'background.paper',
                  boxShadow: selectedCompanyId === company.excel_company_id ? 3 : 1,
                  '&:hover': {
                    borderColor: selectedCompanyId === company.excel_company_id ? 'primary.dark' : 'grey.300',
                    bgcolor: selectedCompanyId === company.excel_company_id ? 'primary.main' : 'action.hover',
                    boxShadow: 3,
                  },
                }}
              >
                <MuiCardContent sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'semibold' }}>
                    {company["Nome Comercial"] || company.excel_company_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    ID Excel: {company.excel_company_id}
                  </Typography>
                </MuiCardContent>
              </MuiCard>
            ))
          )}
        </Box>
      </ScrollArea>
    </Box>
  );
};

export default CompanyAdditionalList;