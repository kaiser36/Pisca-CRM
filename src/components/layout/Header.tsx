"use client";

import React from 'react';
import Button from '@mui/material/Button'; // Import MUI Button
import IconButton from '@mui/material/IconButton'; // Import MUI IconButton
import Typography from '@mui/material/Typography'; // Import MUI Typography
import Box from '@mui/material/Box'; // Import MUI Box for layout
import { Menu } from 'lucide-react'; // Keep Lucide icon for menu

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  // Removed useTheme and theme toggle for initial MUI migration.
  // Dark/light mode can be re-integrated with MUI's theme system later.

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 1, display: { lg: 'none' } }}
        >
          <Menu className="h-5 w-5" />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', letterSpacing: '-0.025em' }}>
          CRM de Clientes Automóveis
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* User profile or other header elements can go here */}
      </Box>
    </Box>
  );
};

export default Header;