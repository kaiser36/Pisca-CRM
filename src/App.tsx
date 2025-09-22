import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CRM from "./pages/CRM";
import Settings from "./pages/Settings";
import Informacao from "./pages/Informacao";
import { CrmDataProvider } from "@/context/CrmDataContext";
import { SessionContextProvider } from "@/components/auth/SessionContextProvider"; // Import SessionContextProvider
import Login from "./pages/Login"; // Import Login page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap with SessionContextProvider */}
          <CrmDataProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} /> {/* Add Login route */}
              <Route path="/crm" element={<CRM />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/informacao" element={<Informacao />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CrmDataProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;