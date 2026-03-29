import {
  LayoutDashboard, Users, ShieldCheck, ArrowUpDown, Settings,
  FileText, Bell, LogOut, Shield, TrendingUp, Wallet, Signal, Copy, ArrowDownLeft, ArrowUpRight, Ticket, DollarSign, Link2, Globe
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo-symbol.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const mainItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "KYC Verification", url: "/admin/kyc", icon: ShieldCheck },
  { title: "Deposits", url: "/admin/deposits", icon: ArrowDownLeft },
  { title: "Withdrawals", url: "/admin/withdrawals", icon: ArrowUpRight },
  { title: "Transactions", url: "/admin/transactions", icon: ArrowUpDown },
  { title: "Investment Plans", url: "/admin/investments", icon: TrendingUp },
  { title: "Signals", url: "/admin/signals", icon: Signal },
  { title: "Copy Trading", url: "/admin/copy-trading", icon: Copy },
  { title: "Wallet Settings", url: "/admin/deposit-methods", icon: Wallet },
  { title: "Ticket Complaints", url: "/admin/tickets", icon: Ticket },
  { title: "Fee Payments", url: "/admin/fee-payments", icon: DollarSign },
  { title: "Referrals", url: "/admin/referrals", icon: Link2 },
];

const systemItems = [
  { title: "Landing Page", url: "/admin/landing", icon: Globe },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Platform Settings", url: "/admin/settings", icon: Settings },
  { title: "Content", url: "/admin/content", icon: FileText },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <NavLink to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="Vertex" className="h-8 w-8 rounded" />
          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-destructive" />
              <span className="font-display font-bold text-sm">
                <span style={{ color: 'hsl(145, 60%, 45%)' }}>Vertex</span>{' '}
                <span style={{ color: 'hsl(225, 65%, 45%)' }}>Admin</span>
              </span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/admin"} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
