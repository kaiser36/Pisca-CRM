"use client";

import React, { useState, useEffect } from 'react';
// import Header from './Header'; // Removed: Header component was deleted
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils'; // Keep cn for utility classes for now

import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Menu as MenuIcon } from 'lucide-react'; // Using Lucide icon for menu

const drawerWidth = 256; // Standard width for the expanded sidebar

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop sidebar collapse

  useEffect(() => {
    // On desktop, sidebar is initially not collapsed. On mobile, it's always "collapsed" (closed).
    setIsSidebarCollapsed(isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarCollapseToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar for Header */}
      <MuiAppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { lg: `calc(100% - ${isSidebarCollapsed ? 64 : drawerWidth}px)` },
          ml: { lg: `${isSidebarCollapsed ? 64 : drawerWidth}px` },
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={isMobile ? handleDrawerToggle : handleSidebarCollapseToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon className="h-5 w-5" />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            CRM de Clientes Automóveis
          </Typography>
          {/* Other header content can go here */}
        </Toolbar>
      </MuiAppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: isSidebarCollapsed ? 64 : drawerWidth }, flexShrink: { lg: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <MuiDrawer
          variant="temporary"
          open={isSidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Toolbar /> {/* Spacer for AppBar */}
          <Sidebar isCollapsed={false} onToggle={handleDrawerToggle} />
        </MuiDrawer>

        {/* Desktop Drawer */}
        <MuiDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isSidebarCollapsed ? 64 : drawerWidth,
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            },
          }}
          open
        >
          <Toolbar /> {/* Spacer for AppBar */}
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarCollapseToggle} />
        </MuiDrawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${isSidebarCollapsed ? 64 : drawerWidth}px)` },
          mt: '64px', // Height of AppBar
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;