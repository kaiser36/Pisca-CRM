"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Building, Settings, ChevronLeft, ChevronRight, Building2, UserCog, Info } from 'lucide-react'; // Importar o ícone Info
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Controlar o estado do Accordion para que fique aberto se uma rota filha estiver ativa
  const [accordionValue, setAccordionValue] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (location.pathname.startsWith('/settings') || location.pathname.startsWith('/accounts')) {
      setAccordionValue('settings-accordion'); // Um valor único para este item do acordeão
    } else {
      setAccordionValue(undefined);
    }
  }, [location.pathname]);

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r bg-sidebar transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!isCollapsed && <span className="text-lg font-semibold text-sidebar-foreground">Navegação</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          {isCollapsed ? <ChevronRight className="h-5 w-5 text-sidebar-foreground" /> : <ChevronLeft className="h-5 w-5 text-sidebar-foreground" />}
        </Button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        <Link to="/">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "px-2" : "px-4",
              isActive('/') && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Home className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Dashboard"}
          </Button>
        </Link>
        <Link to="/crm">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "px-2" : "px-4",
              isActive('/crm') && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Building className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "CRM Empresas"}
          </Button>
        </Link>
        <Link to="/company-additional-data">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "px-2" : "px-4",
              isActive('/company-additional-data') && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Building2 className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Empresas Adicionais"}
          </Button>
        </Link>

        <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue} className="w-full">
          <AccordionItem value="settings-accordion" className="border-b-0">
            <AccordionTrigger className={cn(
              "flex items-center w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-2 px-4 rounded-md transition-colors",
              isCollapsed ? "px-2" : "px-4",
              (location.pathname.startsWith('/settings') || location.pathname.startsWith('/accounts')) && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}>
              <Settings className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
              {!isCollapsed && "Configurações"}
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <Link to="/settings"> {/* Link para a página principal de definições */}
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "px-2" : "px-4",
                    "pl-8", // Indentação para submenu
                    isActive('/settings') && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Info className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && "Visão Geral"}
                </Button>
              </Link>
              <Link to="/accounts">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "px-2" : "px-4",
                    "pl-8", // Indentação para submenu
                    isActive('/accounts') && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <UserCog className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && "Contas"}
                </Button>
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>
    </aside>
  );
};

export default Sidebar;