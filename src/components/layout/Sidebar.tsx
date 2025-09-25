"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Building, Settings, ChevronLeft, ChevronRight, Building2, UserCog, Info, Users, Package, ListTodo, Gift, Settings2, Monitor } from 'lucide-react'; // NEW: Import Monitor icon
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
  const isPathActive = (pathPrefix: string) => location.pathname.startsWith(pathPrefix);

  const [accordionValue, setAccordionValue] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (isPathActive('/settings') || isPathActive('/accounts') || isPathActive('/am-view') || isPathActive('/products') || isPathActive('/campaigns') || isPathActive('/settings/easyvista-types')) {
      setAccordionValue('settings-accordion');
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
              isActive('/') && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
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
              isActive('/crm') && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
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
              isActive('/company-additional-data') && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            )}
          >
            <Building2 className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Empresas Adicionais"}
          </Button>
        </Link>
        {/* NEW: Pisca Console Link */}
        <Link to="/pisca-console">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "px-2" : "px-4",
              isActive('/pisca-console') && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            )}
          >
            <Monitor className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Consola Pisca"}
          </Button>
        </Link>

        <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue} className="w-full">
          <AccordionItem value="settings-accordion" className="border-b-0">
            <AccordionTrigger className={cn(
              "flex items-center w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-2 px-4 rounded-md transition-colors",
              isCollapsed ? "px-2" : "px-4",
              (isPathActive('/settings') || isPathActive('/accounts') || isPathActive('/am-view') || isPathActive('/products') || isPathActive('/campaigns') || isPathActive('/settings/easyvista-types')) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            )}>
              <Settings className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
              {!isCollapsed && "Configurações"}
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <Link to="/settings">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "px-2" : "px-4",
                    "pl-8",
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
                    "pl-8",
                    isActive('/accounts') && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Users className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && "Contas"}
                </Button>
              </Link>
              <Link to="/am-view">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "px-2" : "px-4",
                    "pl-8",
                    isActive('/am-view') && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <UserCog className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && "AM"}
                </Button>
              </Link>
              <Link to="/products">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "px-2" : "px-4",
                    "pl-8",
                    isActive('/products') && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Package className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && "Produtos"}
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "px-2" : "px-4",
                    "pl-8",
                    isActive('/campaigns') && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Gift className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && "Campanhas"}
                </Button>
              </Link>
              <Link to="/settings/easyvista-types">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "px-2" : "px-4",
                    "pl-8",
                    isActive('/settings/easyvista-types') && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Settings2 className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && "Tipos de Easyvista"}
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