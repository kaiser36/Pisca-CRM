import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SessionContextProvider } from "@/context/SessionContext";
import { CrmDataProvider } from "@/context/CrmDataContext";

// Import all page components
import Index from "./Index";
import NotFound from "./NotFound";
import CRM from "./CRM";
import Settings from "./Settings";
import CompanyAdditionalData from "./CompanyAdditionalData";
import CompanyAdditionalDetailPage from "./CompanyAdditionalDetailPage";
import Accounts from "./Accounts";
import AmView from "./AmView";
import Products from "./Products";
import Campaigns from "./Campaigns";
import EasyvistaTypeManagement from "./EasyvistaTypeManagement";
import ContactTypeManagement from "./ContactTypeManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors className="[&>div]:z-[9999]" />
      <BrowserRouter>
        <SessionContextProvider>
          <CrmDataProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/company-additional-data" element={<CompanyAdditionalData />} />
              <Route path="/company-additional-data/:companyExcelId" element={<CompanyAdditionalDetailPage />} />
              
              {/* Settings routes - specific routes first */}
              <Route path="/settings/easyvista-types" element={<EasyvistaTypeManagement />} />
              <Route path="/settings/contact-types" element={<ContactTypeManagement />} />
              <Route path="/settings" element={<Settings />} />
              
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/am-view" element={<AmView />} />
              <Route path="/products" element={<Products />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CrmDataProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App