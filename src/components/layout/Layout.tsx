"use client";

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useSession } from '@/context/SessionContext'; // Import useSession
import { Loader2 } from 'lucide-react'; // Import Loader2 icon

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(isMobile);
  const { isLoading: isAuthLoading, user } = useSession(); // Get auth loading state and user

  React.useEffect(() => {
    setIsSidebarCollapsed(isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // If auth state is loading, show a full-screen loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, don't render the layout, let the router handle redirect to login
  if (!user) {
    return <>{children}</>;
  }

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

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;