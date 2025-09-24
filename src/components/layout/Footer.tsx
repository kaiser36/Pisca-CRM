"use client";

import React from 'react';
import { MadeWithDyad } from '@/components/made-with-dyad';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'text.secondary',
        width: '100%', // Ensure footer spans full width
      }}
    >
      <MadeWithDyad />
    </Box>
  );
};

export default Footer;