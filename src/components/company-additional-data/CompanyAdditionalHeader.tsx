"use client";

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MuiButton from '@mui/material/Button';
import MuiBadge from '@mui/material/Badge';
import MuiCardHeader from '@mui/material/CardHeader';
import { Pencil, PlusCircle, Eye, Handshake, UserPlus } from 'lucide-react';

interface CompanyAdditionalHeaderProps {
  companyDisplayName: string;
  excelCompanyId: string;
  isCompanyClosed: boolean;
  onEditClick: () => void;
  onCreateContactClick: () => void;
  onCreateEasyvistaClick: () => void;
  onCreateDealClick: () => void;
  onCreateEmployeeClick: () => void;
}

const CompanyAdditionalHeader: React.FC<CompanyAdditionalHeaderProps> = ({
  companyDisplayName,
  excelCompanyId,
  isCompanyClosed,
  onEditClick,
  onCreateContactClick,
  onCreateEasyvistaClick,
  onCreateDealClick,
  onCreateEmployeeClick,
}) => {
  return (
    <MuiCardHeader
      title={
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{companyDisplayName}</Typography>
            {isCompanyClosed && (
              <MuiBadge color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', px: 1, py: 0.5, borderRadius: 1 } }}>
                Empresa Encerrada
              </MuiBadge>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <MuiButton variant="outlined" size="small" onClick={onCreateContactClick}>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Contacto
            </MuiButton>
            <MuiButton variant="outlined" size="small" onClick={onCreateEasyvistaClick}>
              <Eye className="mr-2 h-4 w-4" /> Novo Easyvista
            </MuiButton>
            <MuiButton variant="outlined" size="small" onClick={onCreateDealClick}>
              <Handshake className="mr-2 h-4 w-4" /> Novo Negócio
            </MuiButton>
            <MuiButton variant="outlined" size="small" onClick={onCreateEmployeeClick}>
              <UserPlus className="mr-2 h-4 w-4" /> Novo Colaborador
            </MuiButton>
            <MuiButton variant="outlined" size="small" onClick={onEditClick}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </MuiButton>
          </Box>
        </Box>
      }
      subheader={`ID Excel: ${excelCompanyId}`}
      subheaderTypographyProps={{ color: 'text.secondary' }}
      sx={{ pb: 1.5 }}
    />
  );
};

export default CompanyAdditionalHeader;