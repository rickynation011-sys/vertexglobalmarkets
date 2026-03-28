import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminRoute from "./components/AdminRoute.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";

// Static pages
import Markets from "./pages/Markets.tsx";
import About from "./pages/About.tsx";
import Careers from "./pages/Careers.tsx";
import Blog from "./pages/Blog.tsx";
import Contact from "./pages/Contact.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import RiskDisclosure from "./pages/RiskDisclosure.tsx";
import Compliance from "./pages/Compliance.tsx";
import Security from "./pages/Security.tsx";
import Press from "./pages/Press.tsx";
import Trading from "./pages/Trading.tsx";
import Investments from "./pages/Investments.tsx";
import Signals from "./pages/Signals.tsx";
import Plans from "./pages/Plans.tsx";
import RealEstate from "./pages/RealEstate.tsx";
import MarketForex from "./pages/markets/MarketForex.tsx";
import MarketCrypto from "./pages/markets/MarketCrypto.tsx";
import MarketStocks from "./pages/markets/MarketStocks.tsx";
import MarketCommodities from "./pages/markets/MarketCommodities.tsx";
import MarketIndices from "./pages/markets/MarketIndices.tsx";
import MarketRealEstate from "./pages/markets/MarketRealEstate.tsx";
import MarketETFs from "./pages/markets/MarketETFs.tsx";

// Dashboard
import DashboardLayout from "./layouts/DashboardLayout.tsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.tsx";
import DashboardPortfolio from "./pages/dashboard/DashboardPortfolio.tsx";
import DashboardInvestments from "./pages/dashboard/DashboardInvestments.tsx";
import DashboardTrading from "./pages/dashboard/DashboardTrading.tsx";
import DashboardWallet from "./pages/dashboard/DashboardWallet.tsx";
import DashboardHistory from "./pages/dashboard/DashboardHistory.tsx";
import DashboardSettings from "./pages/dashboard/DashboardSettings.tsx";
import DashboardContact from "./pages/dashboard/DashboardContact.tsx";
import DashboardKYC from "./pages/dashboard/DashboardKYC.tsx";

// Admin
import AdminLayout from "./layouts/AdminLayout.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminKYC from "./pages/admin/AdminKYC.tsx";
import AdminTransactions from "./pages/admin/AdminTransactions.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminContent from "./pages/admin/AdminContent.tsx";
import AdminNotifications from "./pages/admin/AdminNotifications.tsx";
import AdminInvestments from "./pages/admin/AdminInvestments.tsx";
import AdminDepositMethods from "./pages/admin/AdminDepositMethods.tsx";
import AdminDeposits from "./pages/admin/AdminDeposits.tsx";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals.tsx";
import AdminSignals from "./pages/admin/AdminSignals.tsx";
import AdminCopyTrading from "./pages/admin/AdminCopyTrading.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Static pages */}
            <Route path="/markets" element={<Markets />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/risk-disclosure" element={<RiskDisclosure />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/security" element={<Security />} />
            <Route path="/press" element={<Press />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/real-estate" element={<RealEstate />} />
            <Route path="/markets/forex" element={<MarketForex />} />
            <Route path="/markets/crypto" element={<MarketCrypto />} />
            <Route path="/markets/stocks" element={<MarketStocks />} />
            <Route path="/markets/commodities" element={<MarketCommodities />} />
            <Route path="/markets/indices" element={<MarketIndices />} />
            <Route path="/markets/real-estate" element={<MarketRealEstate />} />
            <Route path="/markets/etfs" element={<MarketETFs />} />

            {/* User dashboard - protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="portfolio" element={<DashboardPortfolio />} />
                <Route path="investments" element={<DashboardInvestments />} />
                <Route path="trading" element={<DashboardTrading />} />
                <Route path="wallet" element={<DashboardWallet />} />
                <Route path="history" element={<DashboardHistory />} />
                <Route path="settings" element={<DashboardSettings />} />
                <Route path="kyc" element={<DashboardKYC />} />
                <Route path="contact" element={<DashboardContact />} />
              </Route>
            </Route>

            {/* Admin - separate login and role-protected */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="kyc" element={<AdminKYC />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="investments" element={<AdminInvestments />} />
                <Route path="deposit-methods" element={<AdminDepositMethods />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
