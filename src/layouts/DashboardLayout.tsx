import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown";
import { CurrencySelector } from "@/components/dashboard/CurrencySelector";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const DashboardLayout = () => {
  const { user } = useAuth();
  const { PushPromptDialog } = usePushNotifications();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  return (
    <CurrencyProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center justify-between border-b border-border px-4 glass">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">Dashboard</span>
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
          </div>
        </div>
      </SidebarProvider>
    </CurrencyProvider>
  );
};

export default DashboardLayout;
