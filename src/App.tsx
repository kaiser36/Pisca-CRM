import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CRM from "./pages/CRM";
import Settings from "./pages/Settings";
import MaisInfo from "./pages/MaisInfo"; // Import the new page
import { CrmDataProvider } from "@/context/CrmDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CrmDataProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/maisinfo" element={<MaisInfo />} /> {/* Add the new route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CrmDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;