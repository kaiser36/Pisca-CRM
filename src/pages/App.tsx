import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner"; // Este é o Toaster do sonner
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./Index"; // Corrigido
import NotFound from "./NotFound"; // Corrigido
import CRM from "./CRM"; // Corrigido
import Settings from "./Settings"; // Corrigido
import CompanyAdditionalData from "./CompanyAdditionalData"; // Corrigido
import CompanyAdditionalDetailPage from "./CompanyAdditionalDetailPage"; // Corrigido
import Accounts from "./Accounts"; // Corrigido
import AmView from "./AmView"; // Corrigido
import Products from "./Products"; // Corrigido
import Campaigns from "./Campaigns"; // Corrigido
import EasyvistaTypeManagement from "./EasyvistaTypeManagement"; // Corrigido
import { CrmDataProvider } from "@/context/CrmDataContext";
import Analytics from "./Analytics"; // NEW: Import Analytics page

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
            <Route path="/company-additional-data/:companyExcelId" element={<CompanyAdditionalDetailPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/easyvista-types" element={<EasyvistaTypeManagement />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/am-view" element={<AmView />} />
            <Route path="/products" element={<Products />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/analytics" element={<Analytics />} /> {/* NEW: Analytics Route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CrmDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;