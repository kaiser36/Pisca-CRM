"use client";

import React from 'react';
import TextField from '@mui/material/TextField'; // Import MUI TextField
import InputAdornment from '@mui/material/InputAdornment'; // For the search icon
import { Search } from 'lucide-react'; // Keep Lucide icon for search

interface CompanyFilterProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Pesquisar empresas..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search className="h-4 w-4 text-muted-foreground" />
          </InputAdornment>
        ),
      }}
      sx={{ mb: 2 }} // Margin bottom for spacing
    />
  );
};

export default CompanyFilter;