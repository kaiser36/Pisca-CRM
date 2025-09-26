"use client";

import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Sidebar } from './Sidebar'; // Corrigido para importação nomeada
import Footer from './Footer';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}