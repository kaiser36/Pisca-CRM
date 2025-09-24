import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MuiBadge from '@mui/material/Badge';
import { parseISO, format, isPast, differenceInMonths, differenceInDays } from 'date-fns';

// Helper function to render individual fields with consistent styling and logic
export const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0 && !label.includes('Plafond') && !label.includes('Preço') && !label.includes('Bumps') && !label.includes('Investimento') && !label.includes('Stock') && !label.includes('Percentagem'))) return null;

  let displayValue: React.ReactNode = value;
  if (typeof value === 'boolean') {
    displayValue = value ? (
      <MuiBadge color="success" variant="dot" sx={{ '& .MuiBadge-dot': { height: 10, width: 10, borderRadius: '50%' } }}>
        <Typography component="span" sx={{ color: 'success.main', ml: 1 }}>Sim</Typography>
      </MuiBadge>
    ) : (
      <MuiBadge color="error" variant="dot" sx={{ '& .MuiBadge-dot': { height: 10, width: 10, borderRadius: '50%' } }}>
        <Typography component="span" sx={{ color: 'error.main', ml: 1 }}>Não</Typography>
      </MuiBadge>
    );
  } else if (typeof value === 'number') {
    displayValue = value.toLocaleString('pt-PT');
  } else if (label.includes('Link') || label.includes('Site') || label.includes('Logotipo')) {
    displayValue = (
      <a href={String(value)} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
        {String(value)}
      </a>
    );
  } else if (label.includes('Data')) {
    try {
      const date = parseISO(String(value));
      if (!isNaN(date.getTime())) {
        displayValue = date.toLocaleDateString('pt-PT', { year: 'numeric', month: '2-digit', day: '2-digit' });
      } else {
        displayValue = String(value);
      }
    } catch {
      displayValue = String(value);
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
      <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
      <Typography component="span" sx={{ fontWeight: 'medium' }}>{label}:</Typography> <Typography component="span" sx={{ ml: 0.5, color: 'text.primary' }}>{displayValue}</Typography>
    </Box>
  );
};

// Utility functions for date comparisons (can be used by parent components for alert logic)
export const isVisitOld = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return differenceInMonths(new Date(), date) >= 3;
  } catch {
    return false;
  }
};

export const isLoginOld = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return differenceInDays(new Date(), date) >= 7;
  } catch {
    return false;
  }
};