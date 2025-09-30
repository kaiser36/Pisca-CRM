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
import PiscaConsole from "./pages/PiscaConsole";
import Login from "./pages/Login"; // Import the new Login page
import { CrmDataProvider } from "@/context/CrmDataContext";
import { SessionContextProvider } from "@/context/SessionContext"; // Import SessionContextProvider
import ContactTypeSettings from "./pages/ContactTypeSettings"; // Import ContactTypeSettings

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors className="[&>div]:z-[9999]" />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap the entire app with SessionContextProvider */}
          <CrmDataProvider>
            <Routes>
              <Route path="/login" element={<Login />} /> {/* Public login route */}
              {/* Protected routes */}
              <Route path="/" element={<Index />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/company-additional-data" element={<CompanyAdditionalData />} />
              <Route path="/company-additional-data/:companyExcelId" element={<CompanyAdditionalDetailPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/easyvista-types" element={<EasyvistaTypeManagement />} />
              <Route path="/settings/contact-types" element={<ContactTypeSettings />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/am-view" element={<AmView />} />
              <Route path="/products" element={<Products />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/pisca-console" element={<PiscaConsole />} />
              {/* A rota catch-all "*" deve ser sempre a última */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CrmDataProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;