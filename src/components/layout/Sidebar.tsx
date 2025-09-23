"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Building, Settings, ChevronLeft, ChevronRight, Building2, UserCog } from 'lucide-react';
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

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="settings" className="border-b-0">
            <AccordionTrigger className={cn(
              "flex items-center w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-2 px-4 rounded-md transition-colors",
              isCollapsed ? "px-2" : "px-4",
              isActive('/settings') && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}>
              <Settings className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
              {!isCollapsed && "Configurações"}
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <Link to="/accounts">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "px-2" : "px-4",
                    "pl-8", // Indent for submenu
                    isActive('/accounts') && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <UserCog className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && "Contas"}
                </Button>
              </Link>
              {/* Adicione outros itens de submenu de Configurações aqui, se necessário */}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>
    </aside>
  );
};

export default Sidebar;