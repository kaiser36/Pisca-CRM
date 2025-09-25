import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner"; // Este é o Toaster do sonner
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CRM from "./pages/CRM";
import Settings from "./pages/Settings";
import CompanyAdditionalData from "./pages/CompanyAdditionalData";
import CompanyAdditionalDetailPage from "./pages/CompanyAdditionalDetailPage"; // New import
import Accounts from "./pages/Accounts";
import AmView from "./pages/AmView";
import Products from "./pages/Products";
import Campaigns from "./pages/Campaigns"; // NEW: Import Campaigns page
import { CrmDataProvider } from "@/context/CrmDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster /> {/* Este é o Toaster do shadcn/ui, para os toasts mais antigos */}
      {/* Configurado o Toaster do sonner com z-index alto e posição */}
      <Sonner position="top-right" richColors className="[&>div]:z-[9999]" />
      <BrowserRouter>
        <CrmDataProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/company-additional-data" element={<CompanyAdditionalData />} />
            <Route path="/company-additional-data/:companyExcelId" element={<CompanyAdditionalDetailPage />} /> {/* New route */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/am-view" element={<AmView />} />
            <Route path="/products" element={<Products />} />
            <Route path="/campaigns" element={<Campaigns />} /> {/* NEW: Add Campaigns route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CrmDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;