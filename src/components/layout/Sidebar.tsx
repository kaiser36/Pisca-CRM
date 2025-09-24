"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils'; // Keep cn for now for general utility classes
import { Home, Building, Settings, ChevronLeft, ChevronRight, Building2, UserCog, Info, Users, Package } from 'lucide-react';
import MuiButton from '@mui/material/Button'; // Renamed to MuiButton to avoid conflict with shadcn/ui Button
import IconButton from '@mui/material/IconButton';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isPathActive = (pathPrefix: string) => location.pathname.startsWith(pathPrefix);

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  React.useEffect(() => {
    if (isPathActive('/settings') || isPathActive('/accounts') || isPathActive('/am-view') || isPathActive('/products')) {
      setExpanded('settings-accordion');
    } else {
      setExpanded(false);
    }
  }, [location.pathname]);

  return (
    <Box
      component="aside"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'width 300ms ease-in-out',
        width: isCollapsed ? 64 : 256, // 64px for collapsed, 256px for expanded
        flexShrink: 0,
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, px: 2, borderBottom: 1, borderColor: 'divider' }}>
        {!isCollapsed && <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>Navegação</Typography>}
        <IconButton onClick={onToggle} sx={{ ml: 'auto' }}>
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Link to="/">
          <MuiButton
            fullWidth
            variant="text"
            sx={{
              justifyContent: 'flex-start',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: isActive('/') ? 'primary.light' : 'transparent',
              color: isActive('/') ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                bgcolor: isActive('/') ? 'primary.main' : 'action.hover',
                color: isActive('/') ? 'primary.contrastText' : 'text.primary',
              },
              px: isCollapsed ? 1 : 2,
            }}
          >
            <Home className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Dashboard"}
          </MuiButton>
        </Link>
        <Link to="/crm">
          <MuiButton
            fullWidth
            variant="text"
            sx={{
              justifyContent: 'flex-start',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: isActive('/crm') ? 'primary.light' : 'transparent',
              color: isActive('/crm') ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                bgcolor: isActive('/crm') ? 'primary.main' : 'action.hover',
                color: isActive('/crm') ? 'primary.contrastText' : 'text.primary',
              },
              px: isCollapsed ? 1 : 2,
            }}
          >
            <Building className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "CRM Empresas"}
          </MuiButton>
        </Link>
        <Link to="/company-additional-data">
          <MuiButton
            fullWidth
            variant="text"
            sx={{
              justifyContent: 'flex-start',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: isActive('/company-additional-data') ? 'primary.light' : 'transparent',
              color: isActive('/company-additional-data') ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                bgcolor: isActive('/company-additional-data') ? 'primary.main' : 'action.hover',
                color: isActive('/company-additional-data') ? 'primary.contrastText' : 'text.primary',
              },
              px: isCollapsed ? 1 : 2,
            }}
          >
            <Building2 className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Empresas Adicionais"}
          </MuiButton>
        </Link>

        <MuiAccordion expanded={expanded === 'settings-accordion'} onChange={handleChange('settings-accordion')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
          <MuiAccordionSummary
            expandIcon={isCollapsed ? null : (expanded === 'settings-accordion' ? <ChevronUpIcon /> : <ChevronDownIcon />)} // Use Lucide icons for expand/collapse
            aria-controls="panel1bh-content"
            id="panel1bh-header"
            sx={{
              minHeight: 48,
              '& .MuiAccordionSummary-content': { marginY: 0 },
              '& .MuiAccordionSummary-expandIconWrapper': { transform: 'rotate(0deg)' },
              '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(180deg)' },
              bgcolor: (isPathActive('/settings') || isPathActive('/accounts') || isPathActive('/am-view') || isPathActive('/products')) ? 'primary.light' : 'transparent',
              color: (isPathActive('/settings') || isPathActive('/accounts') || isPathActive('/am-view') || isPathActive('/products')) ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                bgcolor: (isPathActive('/settings') || isPathActive('/accounts') || isPathActive('/am-view') || isPathActive('/products')) ? 'primary.main' : 'action.hover',
                color: (isPathActive('/settings') || isPathActive('/accounts') || isPathActive('/am-view') || isPathActive('/products')) ? 'primary.contrastText' : 'text.primary',
              },
              px: isCollapsed ? 1 : 2,
            }}
          >
            <Settings className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && <Typography sx={{ fontWeight: 'medium' }}>Configurações</Typography>}
          </MuiAccordionSummary>
          <MuiAccordionDetails sx={{ p: 0, bgcolor: 'background.default' }}>
            <Link to="/settings">
              <MuiButton
                fullWidth
                variant="text"
                sx={{
                  justifyContent: 'flex-start',
                  pl: isCollapsed ? 1 : 4, // Indent submenu items
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: isActive('/settings') ? 'action.selected' : 'transparent',
                  color: isActive('/settings') ? 'primary.main' : 'text.secondary',
                }}
              >
                <Info className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && "Visão Geral"}
              </MuiButton>
            </Link>
            <Link to="/accounts">
              <MuiButton
                fullWidth
                variant="text"
                sx={{
                  justifyContent: 'flex-start',
                  pl: isCollapsed ? 1 : 4,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: isActive('/accounts') ? 'action.selected' : 'transparent',
                  color: isActive('/accounts') ? 'primary.main' : 'text.secondary',
                }}
              >
                <Users className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && "Contas"}
              </MuiButton>
            </Link>
            <Link to="/am-view">
              <MuiButton
                fullWidth
                variant="text"
                sx={{
                  justifyContent: 'flex-start',
                  pl: isCollapsed ? 1 : 4,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: isActive('/am-view') ? 'action.selected' : 'transparent',
                  color: isActive('/am-view') ? 'primary.main' : 'text.secondary',
                }}
              >
                <UserCog className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && "AM"}
              </MuiButton>
            </Link>
            <Link to="/products">
              <MuiButton
                fullWidth
                variant="text"
                sx={{
                  justifyContent: 'flex-start',
                  pl: isCollapsed ? 1 : 4,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: isActive('/products') ? 'action.selected' : 'transparent',
                  color: isActive('/products') ? 'primary.main' : 'text.secondary',
                }}
              >
                <Package className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && "Produtos"}
              </MuiButton>
            </Link>
          </MuiAccordionDetails>
        </MuiAccordion>
      </Box>
    </Box>
  );
};

// Helper icons for AccordionSummary
const ChevronUpIcon = () => <ChevronUp className="h-4 w-4" />;
const ChevronDownIcon = () => <ChevronDown className="h-4 w-4" />;

// Import ChevronUp and ChevronDown from lucide-react
import { ChevronUp, ChevronDown } from 'lucide-react';

export default Sidebar;