"use client";

import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Sidebar } from './Sidebar';
import Footer from './Footer';
import React from 'react'; // Importar React para React.ReactNode

interface LayoutProps {
  children: React.ReactNode; // Adicionar a prop children
}

export function Layout({ children }: LayoutProps) { // Aceitar children como prop
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children} {/* Renderizar os children aqui */}
        </main>
      </div>
      <Footer />
    </div>
  );
}