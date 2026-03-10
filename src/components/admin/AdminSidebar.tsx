import {
  LayoutDashboard, Users, ShieldCheck, ArrowUpDown, Settings,
  FileText, Bell, LogOut, Shield, TrendingUp
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo.jpg";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "KYC Verification", url: "/admin/kyc", icon: ShieldCheck },
  { title: "Transactions", url: "/admin/transactions", icon: ArrowUpDown },
  { title: "Investments", url: "/admin/investments", icon: TrendingUp },
];

const systemItems = [
  { title: "Platform Settings", url: "/admin/settings", icon: Settings },
  { title: "Content", url: "/admin/content", icon: FileText },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <NavLink to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="Vertex" className="h-8 w-8 rounded" />
          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-destructive" />
              <span className="font-display font-bold text-sm text-foreground">Admin</span>
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
        <SidebarMenuButton asChild>
          <NavLink to="/" className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Exit Admin</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
