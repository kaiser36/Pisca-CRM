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
import CompanyAdditionalDetailPage from "./pages/CompanyAdditionalDetailPage";
import Accounts from "./pages/Accounts";
import AmView from "./pages/AmView";
import Products from "./pages/Products";
import Campaigns from "./pages/Campaigns";
import EasyvistaTypeManagement from "./pages/EasyvistaTypeManagement";
import { CrmDataProvider } from "@/context/CrmDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors className="[&>div]:z-[9999]" />
      <BrowserRouter>
        <CrmDataProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/company-additional-data" element={<CompanyAdditionalData />} />
            <Route path="/company-additional-data/:companyExcelId" element={<CompanyAdditionalDetailPage />} />
            <Route path="/settings" element={<Settings />} />
            {/* Mover a rota EasyvistaTypeManagement para cima para garantir que é apanhada antes de rotas mais genéricas */}
            <Route path="/settings/easyvista-types" element={<EasyvistaTypeManagement />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/am-view" element={<AmView />} />
            <Route path="/products" element={<Products />} />
            <Route path="/campaigns" element={<Campaigns />} />
            {/* A rota catch-all "*" deve ser sempre a última */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CrmDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;