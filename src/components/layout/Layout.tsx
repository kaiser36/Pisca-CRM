"use client";

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(isMobile);

  React.useEffect(() => {
    setIsSidebarCollapsed(isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for larger screens, always visible but collapsible */}
        <div className={cn("hidden lg:flex", isSidebarCollapsed ? "w-16" : "w-64")}>
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Overlay for mobile sidebar */}
        {isMobile && !isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-20"
            onClick={toggleSidebar}
          />
        )}
        {isMobile && (
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out",
              isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
            )}
          >
            <Sidebar isCollapsed={false} onToggle={toggleSidebar} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 bg-muted/40">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;