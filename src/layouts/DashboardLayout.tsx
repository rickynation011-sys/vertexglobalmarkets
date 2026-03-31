import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown";
import { CurrencySelector } from "@/components/dashboard/CurrencySelector";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Shield, Lock } from "lucide-react";
import { useEffect } from "react";

const DashboardLayout = () => {
  const { user } = useAuth();
  const { PushPromptDialog } = usePushNotifications();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!user?.id) return;

    const userId = user.id;
    const channel = supabase
      .channel(`dashboard-financials-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "investments", filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["investments", userId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profit_logs", filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["profit_logs", userId] });
        queryClient.invalidateQueries({ queryKey: ["profit_logs_history", userId] });
        queryClient.invalidateQueries({ queryKey: ["total_profit", userId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "trades", filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["trades", userId] });
        queryClient.invalidateQueries({ queryKey: ["trades-open", userId] });
        queryClient.invalidateQueries({ queryKey: ["all_trades", userId] });
        queryClient.invalidateQueries({ queryKey: ["copy-trades", userId] });
        queryClient.invalidateQueries({ queryKey: ["copy-history", userId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "fee_payments", filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["fee_payments", userId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

  return (
    <CurrencyProvider>
      {PushPromptDialog}
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card/50">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">Dashboard</span>
                <div className="hidden md:flex items-center gap-3 ml-4 text-[10px] text-muted-foreground/70">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure Account</span>
                  <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Data Protected</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CurrencySelector />
                <span className="text-sm text-muted-foreground hidden sm:block">{profile?.full_name || user?.email}</span>
                <NotificationBell />
                <UserProfileDropdown />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <Outlet />
            </main>
            <footer className="border-t border-border px-4 py-2 text-center">
              <p className="text-[10px] text-muted-foreground/50">
                Trading involves significant risk and may not be suitable for all investors. You may lose part or all of your capital.
              </p>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </CurrencyProvider>
  );
};

export default DashboardLayout;
