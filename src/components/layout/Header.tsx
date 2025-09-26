"use client";

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { UserNav } from './UserNav'; // Assuming UserNav exists and is correctly imported

// Removendo onToggleSidebar, pois a funcionalidade de alternar a sidebar foi removida
interface HeaderProps {
  // onToggleSidebar: () => void; // Esta prop já não é necessária
}

export default function Header({}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background px-4 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        {/* O botão de menu pode ser removido se a sidebar não for mais alternável */}
        {/* <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden mr-2">
          <Menu className="h-5 w-5" />
        </Button> */}
        <Link to="/" className="text-xl font-bold text-primary">
          Pisca CRM
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <UserNav />
      </div>
    </header>
  );
}