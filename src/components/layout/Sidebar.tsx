"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Building, Settings, ChevronLeft, ChevronRight, Info, FileText } from 'lucide-react'; // Import FileText icon

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
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
              isCollapsed ? "px-2" : "px-4"
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
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            <Building className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Empresas"}
          </Button>
        </Link>
        <Link to="/maisinfo">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            <Info className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Mais Info"}
          </Button>
        </Link>
        <Link to="/informacao"> {/* New link for Informação */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            <FileText className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Informação"}
          </Button>
        </Link>
        <Link to="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            <Settings className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Configurações"}
          </Button>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;