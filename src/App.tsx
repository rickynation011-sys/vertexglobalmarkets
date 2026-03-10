import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import DashboardLayout from "./layouts/DashboardLayout.tsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.tsx";
import DashboardPortfolio from "./pages/dashboard/DashboardPortfolio.tsx";
import DashboardInvestments from "./pages/dashboard/DashboardInvestments.tsx";
import DashboardTrading from "./pages/dashboard/DashboardTrading.tsx";
import DashboardWallet from "./pages/dashboard/DashboardWallet.tsx";
import DashboardHistory from "./pages/dashboard/DashboardHistory.tsx";
import DashboardSettings from "./pages/dashboard/DashboardSettings.tsx";
import DashboardContact from "./pages/dashboard/DashboardContact.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="portfolio" element={<DashboardPortfolio />} />
            <Route path="investments" element={<DashboardInvestments />} />
            <Route path="trading" element={<DashboardTrading />} />
            <Route path="wallet" element={<DashboardWallet />} />
            <Route path="history" element={<DashboardHistory />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="contact" element={<DashboardContact />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
