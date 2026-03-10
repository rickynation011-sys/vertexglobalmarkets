import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, ArrowUpDown, DollarSign, TrendingUp, AlertTriangle, Loader2, Play, History, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  totalUsers: number;
  pendingKYC: number;
  pendingTransactions: number;
  totalRevenue: number;
  flaggedAccounts: number;
}

interface RecentActivity {
  action: string;
  user: string;
  time: string;
  type: "info" | "warning" | "success" | "error";
}

interface ProcessingLog {
  id: string;
  processed_count: number;
  total_profit: number;
  status: string;
  error_message: string | null;
  triggered_by: string;
  created_at: string;
}

const typeColors: Record<string, string> = {
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  error: "bg-destructive/10 text-destructive",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchProcessingLogs = async () => {
    const { data } = await supabase
      .from("profit_processing_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    setProcessingLogs((data as ProcessingLog[]) ?? []);
  };

  const handleProcessProfits = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-daily-profits");
      if (error) throw error;
      toast({ title: "Profits Processed", description: data?.message ?? "Done" });
      fetchProcessingLogs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      fetchProcessingLogs();
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [profilesRes, kycRes, txRes] = await Promise.all([
        supabase.from("profiles").select("id, status", { count: "exact" }),
        supabase.from("kyc_verifications").select("id, status", { count: "exact" }),
        supabase.from("transactions").select("id, status, type, amount, created_at", { count: "exact" }),
      ]);

      const profiles = profilesRes.data ?? [];
      const kycs = kycRes.data ?? [];
      const txs = txRes.data ?? [];

      const pendingKYC = kycs.filter((k) => k.status === "pending").length;
      const pendingTx = txs.filter((t) => t.status === "pending").length;
      const totalRevenue = txs
        .filter((t) => t.status === "completed" || t.status === "approved")
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);
      const flagged = profiles.filter((p) => p.status === "suspended").length;

      setStats({
        totalUsers: profilesRes.count ?? profiles.length,
        pendingKYC,
        pendingTransactions: pendingTx,
        totalRevenue,
        flaggedAccounts: flagged,
      });

      const recentItems: RecentActivity[] = [];
      const recentTxs = [...txs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      for (const tx of recentTxs) {
        const typeMap: Record<string, "info" | "warning" | "success" | "error"> = {
          pending: "warning",
          approved: "success",
          completed: "success",
          rejected: "error",
        };
        recentItems.push({
          action: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} — $${tx.amount.toLocaleString()} (${tx.status})`,
          user: tx.type,
          time: new Date(tx.created_at).toLocaleDateString(),
          type: typeMap[tx.status] ?? "info",
        });
      }

      setActivity(recentItems);
      await fetchProcessingLogs();
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers?.toLocaleString() ?? "0", change: "Registered accounts", icon: Users, color: "text-primary" },
    { label: "Pending KYC", value: String(stats?.pendingKYC ?? 0), change: "Needs review", icon: ShieldCheck, color: "text-warning" },
    { label: "Pending Transactions", value: String(stats?.pendingTransactions ?? 0), change: "Awaiting approval", icon: ArrowUpDown, color: "text-info" },
    { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, change: "Completed transactions", icon: DollarSign, color: "text-success" },
    { label: "Flagged Accounts", value: String(stats?.flaggedAccounts ?? 0), change: "Requires attention", icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform overview and management</p>
        </div>
        <Button onClick={handleProcessProfits} disabled={processing} size="sm" variant="outline">
          {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Process Daily Profits
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
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

      {/* Profit Processing History */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Profit Processing History</h2>
          </div>
          {processingLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No processing runs yet</p>
          ) : (
            <div className="space-y-0">
              {processingLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    {log.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <div>
                      <p className="text-sm text-foreground">
                        {log.status === "success"
                          ? `Processed ${log.processed_count} investment${log.processed_count !== 1 ? "s" : ""} — $${Number(log.total_profit).toFixed(2)} total profit`
                          : `Failed: ${log.error_message ?? "Unknown error"}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Triggered: {log.triggered_by}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-foreground mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-0">
              {activity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[item.type]}`}>
                      {item.type}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{item.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
