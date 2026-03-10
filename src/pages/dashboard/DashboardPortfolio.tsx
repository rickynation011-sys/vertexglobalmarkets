import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const DashboardPortfolio = () => {
  const { user } = useAuth();

  const { data: trades } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: investments } = useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("investments").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const completedDeposits = (transactions ?? []).filter(t => t.type === "deposit" && t.status === "completed");
  const completedWithdrawals = (transactions ?? []).filter(t => t.type === "withdrawal" && t.status === "completed");
  const totalDeposited = completedDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawn = completedWithdrawals.reduce((s, t) => s + Number(t.amount), 0);
  const tradePnl = (trades ?? []).reduce((s, t) => s + Number(t.pnl ?? 0), 0);
  const investmentValue = (investments ?? []).filter(i => i.status === "active").reduce((s, i) => s + Number(i.current_value), 0);
  const totalValue = totalDeposited - totalWithdrawn + tradePnl + investmentValue;

  // Monthly P&L from closed trades
  const performanceData = useMemo(() => {
    const closedTrades = (trades ?? []).filter(t => t.status === "closed");
    const monthly = new Map<string, { profit: number; loss: number }>();
    closedTrades.forEach(t => {
      const m = new Date(t.closed_at ?? t.created_at).toLocaleString("en-US", { month: "short" });
      const existing = monthly.get(m) ?? { profit: 0, loss: 0 };
      const pnl = Number(t.pnl ?? 0);
      if (pnl >= 0) existing.profit += pnl;
      else existing.loss += pnl;
      monthly.set(m, existing);
    });
    if (monthly.size === 0) return [{ month: "No data", profit: 0, loss: 0 }];
    return Array.from(monthly.entries()).map(([month, v]) => ({ month, ...v }));
  }, [trades]);

  // Holdings = open trades grouped by asset
  const holdings = useMemo(() => {
    const openTrades = (trades ?? []).filter(t => t.status === "open");
    const assetMap = new Map<string, { amount: number; pnl: number }>();
    openTrades.forEach(t => {
      const existing = assetMap.get(t.asset) ?? { amount: 0, pnl: 0 };
      existing.amount += Number(t.amount);
      existing.pnl += Number(t.pnl ?? 0);
      assetMap.set(t.asset, existing);
    });
    return Array.from(assetMap.entries()).map(([asset, v]) => ({
      asset,
      value: v.amount,
      pnl: v.pnl,
      change: v.amount > 0 ? ((v.pnl / v.amount) * 100).toFixed(1) : "0.0",
      up: v.pnl >= 0,
    }));
  }, [trades]);

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Portfolio</h1>
        <p className="text-muted-foreground text-sm">Track your holdings and performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-display font-bold text-foreground">{fmt(totalValue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Trading P&L</p>
            <p className={`text-2xl font-display font-bold ${tradePnl >= 0 ? "text-success" : "text-destructive"}`}>{tradePnl >= 0 ? "+" : ""}{fmt(tradePnl)}</p>
            <p className="text-xs text-muted-foreground mt-1">{(trades ?? []).filter(t => t.status === "closed").length} closed trades</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active Investments</p>
            <p className="text-2xl font-display font-bold text-foreground">{fmt(investmentValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{(investments ?? []).filter(i => i.status === "active").length} plans active</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Monthly P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={performanceData}>
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
              <Bar dataKey="profit" fill="hsl(145, 60%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loss" fill="hsl(0, 70%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Open Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No open positions. Place a trade to see your holdings here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Asset</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Value</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">P&L</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.asset} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium text-foreground">{h.asset}</td>
                      <td className="py-3 text-foreground">{fmt(h.value)}</td>
                      <td className={`py-3 ${h.up ? "text-success" : "text-destructive"}`}>{h.up ? "+" : ""}{fmt(h.pnl)}</td>
                      <td className={`py-3 text-right flex items-center justify-end gap-1 ${h.up ? "text-success" : "text-destructive"}`}>
                        {h.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {h.change}%
                      </td>
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

export default DashboardPortfolio;
