import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Briefcase, PieChart, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart as RechartsPie, Pie } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const COLORS = ["hsl(var(--primary))", "hsl(145, 60%, 45%)", "hsl(195, 70%, 45%)", "hsl(45, 80%, 50%)", "hsl(280, 60%, 55%)", "hsl(0, 70%, 50%)"];

const DashboardPortfolio = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });

  const { data: trades } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });

  const { data: investments } = useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("investments").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });

  const { data: profitLogs } = useQuery({
    queryKey: ["profit_logs", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profit_logs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });

  const walletBalance = Number(profile?.wallet_balance ?? 0);
  const isSuccessful = (status: string) => status === "completed" || status === "approved";
  const completedDeposits = (transactions ?? []).filter(t => t.type === "deposit" && isSuccessful(t.status));
  const completedWithdrawals = (transactions ?? []).filter(t => t.type === "withdrawal" && isSuccessful(t.status));
  const totalDeposited = completedDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawn = completedWithdrawals.reduce((s, t) => s + Number(t.amount), 0);
  const activeInvestments = (investments ?? []).filter(i => i.status === "active");
  const investmentValue = activeInvestments.reduce((s, i) => s + Number(i.current_value), 0);
  const investmentCost = activeInvestments.reduce((s, i) => s + Number(i.amount), 0);
  // Total profit from profit_logs (investment daily payouts) + closed trade P&L + admin adjustments
  const tradePnl = (trades ?? []).filter(t => t.status === "closed").reduce((s, t) => s + Number(t.pnl ?? 0), 0);
  const profitEarned = (profitLogs ?? []).reduce((s, l) => s + Number(l.amount), 0);
  const adminCredits = (transactions ?? []).filter(t => t.type === "admin_credit" && isSuccessful(t.status)).reduce((s, t) => s + Number(t.amount), 0);
  const adminDebits = (transactions ?? []).filter(t => t.type === "admin_debit" && isSuccessful(t.status)).reduce((s, t) => s + Number(t.amount), 0);
  const totalValue = walletBalance + investmentValue;
  const totalProfit = profitEarned + tradePnl + adminCredits - adminDebits;

  // Copy trade allocations
  const copyTrades = (trades ?? []).filter(t => t.status === "open" && t.asset.startsWith("COPY:"));
  const copyAllocated = copyTrades.reduce((s, t) => s + Number(t.amount), 0);

  // Asset allocation for pie chart
  const allocationData = useMemo(() => {
    const data = [];
    if (walletBalance > 0) data.push({ name: "Cash Balance", value: walletBalance });
    if (investmentValue > 0) data.push({ name: "Investments", value: investmentValue });
    if (copyAllocated > 0) data.push({ name: "Copy Trading", value: copyAllocated });
    const regularTrades = (trades ?? []).filter(t => t.status === "open" && !t.asset.startsWith("COPY:"));
    const tradeValue = regularTrades.reduce((s, t) => s + Number(t.amount), 0);
    if (tradeValue > 0) data.push({ name: "Open Trades", value: tradeValue });
    return data.length > 0 ? data : [{ name: "No Assets", value: 1 }];
  }, [walletBalance, investmentValue, copyAllocated, trades]);

  // Profit growth chart
  const profitGrowth = useMemo(() => {
    const logs = [...(profitLogs ?? [])].reverse();
    if (logs.length === 0) return [{ date: "Now", total: 0 }];
    let running = 0;
    return logs.map(l => {
      running += Number(l.amount);
      return { date: new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), total: running };
    });
  }, [profitLogs]);

  // Monthly P&L
  const performanceData = useMemo(() => {
    const closedTrades = (trades ?? []).filter(t => t.status === "closed");
    const monthly = new Map<string, { profit: number; loss: number }>();
    closedTrades.forEach(t => {
      const m = new Date(t.closed_at ?? t.created_at).toLocaleString("en-US", { month: "short" });
      const existing = monthly.get(m) ?? { profit: 0, loss: 0 };
      const pnl = Number(t.pnl ?? 0);
      if (pnl >= 0) existing.profit += pnl; else existing.loss += pnl;
      monthly.set(m, existing);
    });
    if (monthly.size === 0) return [{ month: "No data", profit: 0, loss: 0 }];
    return Array.from(monthly.entries()).map(([month, v]) => ({ month, ...v }));
  }, [trades]);

  const holdings = useMemo(() => {
    const openTrades = (trades ?? []).filter(t => t.status === "open" && !t.asset.startsWith("COPY:"));
    const assetMap = new Map<string, { amount: number; pnl: number }>();
    openTrades.forEach(t => {
      const existing = assetMap.get(t.asset) ?? { amount: 0, pnl: 0 };
      existing.amount += Number(t.amount);
      existing.pnl += Number(t.pnl ?? 0);
      assetMap.set(t.asset, existing);
    });
    return Array.from(assetMap.entries()).map(([asset, v]) => ({
      asset, value: v.amount, pnl: v.pnl,
      change: v.amount > 0 ? ((v.pnl / v.amount) * 100).toFixed(1) : "0.0",
      up: v.pnl >= 0,
    }));
  }, [trades]);

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Portfolio</h1>
        <p className="text-muted-foreground text-sm">Track your holdings, performance, and asset allocation</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{fmt(totalValue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <p className="text-xs text-muted-foreground">Total Profit</p>
            </div>
            <p className={`text-2xl font-display font-bold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
              {totalProfit >= 0 ? "+" : ""}{fmt(totalProfit)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Active Investments</p>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{fmt(investmentValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeInvestments.length} plans active</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Copy Trading</p>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{fmt(copyAllocated)}</p>
            <p className="text-xs text-muted-foreground mt-1">{copyTrades.length} active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Profit Growth Chart */}
        <Card className="bg-card border-border lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={profitGrowth}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} formatter={(v: number) => [fmt(v), "Total Profit"]} />
                <Area type="monotone" dataKey="total" stroke="hsl(145, 60%, 45%)" fill="url(#profitGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation Pie */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {allocationData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))", fontSize: "12px" }} formatter={(v: number) => [fmt(v)]} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {allocationData.filter(d => d.name !== "No Assets").map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly P&L */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Monthly P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={performanceData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
              <Bar dataKey="profit" fill="hsl(145, 60%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loss" fill="hsl(0, 70%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Holdings */}
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
