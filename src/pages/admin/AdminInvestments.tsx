import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, Building2, DollarSign } from "lucide-react";

const AdminInvestments = () => {
  const { data: investments, isLoading } = useQuery({
    queryKey: ["admin-investments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0;
  const totalCurrentValue = investments?.reduce((sum, inv) => sum + Number(inv.current_value), 0) ?? 0;
  const activeCount = investments?.filter(i => i.status === "active").length ?? 0;
  const realEstateInvestments = investments?.filter(i => i.plan_name.toLowerCase().includes("real estate")) ?? [];

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusColor: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    completed: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Investment Management</h1>
        <p className="text-muted-foreground text-sm">Overview of all user investments including real estate</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Investments</p>
                <p className="text-xl font-display font-bold text-foreground">{investments?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Invested</p>
                <p className="text-xl font-display font-bold text-foreground">{fmt(totalInvested)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="h-5 w-5 text-emerald-400" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Current Value</p>
                <p className="text-xl font-display font-bold text-foreground">{fmt(totalCurrentValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Real Estate</p>
                <p className="text-xl font-display font-bold text-foreground">{realEstateInvestments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">All Investments</CardTitle>
        </CardHeader>
        <CardContent>
          {investments?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No investments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">User ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Plan</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Current Value</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Return</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Start Date</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investments?.map((inv) => (
                    <tr key={inv.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{inv.user_id.slice(0, 8)}...</td>
                      <td className="py-3 px-3 font-medium text-foreground">{inv.plan_name}</td>
                      <td className="py-3 px-3 text-muted-foreground">{fmt(Number(inv.amount))}</td>
                      <td className="py-3 px-3 text-foreground">{fmt(Number(inv.current_value))}</td>
                      <td className="py-3 px-3 text-emerald-400">+{Number(inv.return_pct ?? 0).toFixed(1)}%</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={statusColor[inv.status] ?? ""}>{inv.status}</Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{new Date(inv.started_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{new Date(inv.ends_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvestments;
