"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Building, Settings, ChevronLeft, ChevronRight, FileText, LogIn, LogOut } from 'lucide-react';
import { useSession } from '@/components/auth/SessionContextProvider'; // Import useSession
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
      showError("Falha ao fazer logout.");
    } else {
      showSuccess("Logout efetuado com sucesso!");
      navigate('/login');
    }
  };

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
        <Link to="/informacao">
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
      <div className="p-2 border-t">
        {session ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "px-2" : "px-4"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Sair"}
          </Button>
        ) : (
          <Link to="/login">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed ? "px-2" : "px-4"
              )}
            >
              <LogIn className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
              {!isCollapsed && "Login"}
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;