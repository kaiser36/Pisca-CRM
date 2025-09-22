"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { useSession } from '@/components/auth/SessionContextProvider'; // Import useSession
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
      showError("Falha ao fazer logout.");
    } else {
      showSuccess("Logout efetuado com sucesso!");
      navigate('/login'); // Redireciona para a página de login após o logout
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">CRM de Clientes Automóveis</h1>
      </div>
      {session && (
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      )}
    </header>
  );
};

export default Header;