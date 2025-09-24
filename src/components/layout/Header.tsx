"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <img 
          src="https://www.piscapisca.pt/assets/img/svg/top-header/pisca-pisca-color.svg" 
          alt="Pisca CRM Logo" 
          className="h-8 mr-3" // Adjust height and margin as needed
        />
        <h1 className="text-2xl font-bold tracking-tight">Pisca CRM</h1>
      </div>
      {/* Aqui pode adicionar outros elementos do cabeçalho, como um perfil de utilizador ou notificações */}
    </header>
  );
};

export default Header;