import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CRM from "./pages/CRM";
import Settings from "./pages/Settings";
import CompanyAdditionalData from "./pages/CompanyAdditionalData";
import Accounts from "./pages/Accounts";
import AmView from "./pages/AmView";
import Products from "./pages/Products";
import { CrmDataProvider } from "@/context/CrmDataContext";
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme"> {/* Wrap with ThemeProvider */}
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" richColors className="[&>div]:z-[9999]" />
        <BrowserRouter>
          <CrmDataProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/company-additional-data" element={<CompanyAdditionalData />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/am-view" element={<AmView />} />
              <Route path="/products" element={<Products />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CrmDataProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;