import { Card, CardContent } from "@/components/ui/card";
import { Users, ShieldCheck, ArrowUpDown, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Total Users", value: "12,847", change: "+142 today", icon: Users, color: "text-primary" },
  { label: "Pending KYC", value: "38", change: "Needs review", icon: ShieldCheck, color: "text-warning" },
  { label: "Pending Transactions", value: "24", change: "12 deposits, 12 withdrawals", icon: ArrowUpDown, color: "text-info" },
  { label: "Total Revenue", value: "$2.4M", change: "+12.5% this month", icon: DollarSign, color: "text-success" },
  { label: "Active Traders", value: "4,231", change: "33% of users", icon: TrendingUp, color: "text-accent" },
  { label: "Flagged Accounts", value: "7", change: "Requires attention", icon: AlertTriangle, color: "text-destructive" },
];

const recentActivity = [
  { action: "New user registration", user: "sarah@email.com", time: "2 min ago", type: "info" },
  { action: "KYC submitted", user: "john.doe@email.com", time: "5 min ago", type: "warning" },
  { action: "Deposit approved", user: "mike.w@email.com", time: "12 min ago", type: "success" },
  { action: "Withdrawal request", user: "anna.k@email.com", time: "18 min ago", type: "info" },
  { action: "Account flagged", user: "suspicious@email.com", time: "25 min ago", type: "error" },
  { action: "KYC approved", user: "jane.s@email.com", time: "32 min ago", type: "success" },
  { action: "Large deposit", user: "whale@email.com", time: "45 min ago", type: "info" },
  { action: "Password reset", user: "forgot@email.com", time: "1 hr ago", type: "info" },
];

const typeColors: Record<string, string> = {
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  error: "bg-destructive/10 text-destructive",
};

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[item.type]}`}>
                    {item.type}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
