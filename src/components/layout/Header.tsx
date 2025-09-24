"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes'; // Import useTheme hook

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">CRM de Clientes Automóveis</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        {/* Aqui pode adicionar outros elementos do cabeçalho, como um perfil de utilizador ou notificações */}
      </div>
    </header>
  );
};

export default Header;