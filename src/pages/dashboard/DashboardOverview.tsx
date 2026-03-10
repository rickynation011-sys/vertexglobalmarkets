import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Briefcase, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const allocationColors = [
  "hsl(145, 60%, 45%)",
  "hsl(195, 70%, 45%)",
  "hsl(215, 60%, 50%)",
  "hsl(40, 90%, 55%)",
  "hsl(280, 50%, 50%)",
];

const DashboardOverview = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: trades } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: investments } = useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Calculate stats from real data
  const completedDeposits = (transactions ?? []).filter(t => t.type === "deposit" && t.status === "completed");
  const completedWithdrawals = (transactions ?? []).filter(t => t.type === "withdrawal" && t.status === "completed");
  const totalDeposited = completedDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawn = completedWithdrawals.reduce((s, t) => s + Number(t.amount), 0);
  const tradePnl = (trades ?? []).reduce((s, t) => s + Number(t.pnl ?? 0), 0);
  const walletBalance = Number(profile?.wallet_balance ?? 0);
  const balance = totalDeposited - totalWithdrawn + tradePnl + walletBalance;
  const activeInvestments = (investments ?? []).filter(i => i.status === "active");
  const closedTrades = (trades ?? []).filter(t => t.status === "closed");
  const winningTrades = closedTrades.filter(t => Number(t.pnl ?? 0) > 0);
  const winRate = closedTrades.length > 0 ? ((winningTrades.length / closedTrades.length) * 100).toFixed(1) : "0.0";

  const stats = [
    { label: "Account Balance", value: `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: transactions?.length ? `${transactions.length} txns` : "—", up: balance >= 0, icon: DollarSign },
    { label: "Total Profit", value: `$${tradePnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: closedTrades.length ? `${closedTrades.length} trades` : "—", up: tradePnl >= 0, icon: TrendingUp },
    { label: "Active Investments", value: String(activeInvestments.length), change: `$${activeInvestments.reduce((s, i) => s + Number(i.amount), 0).toLocaleString()}`, up: true, icon: Briefcase },
    { label: "Win Rate", value: `${winRate}%`, change: `${closedTrades.length} closed`, up: Number(winRate) >= 50, icon: Activity },
  ];

  // Build portfolio chart from transactions (cumulative balance over time)
  const portfolioData = (() => {
    const allTxns = [...(transactions ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (allTxns.length === 0) return [{ date: "Now", value: 0 }];
    let running = 0;
    return allTxns.map(t => {
      if (t.type === "deposit" && t.status === "completed") running += Number(t.amount);
      if (t.type === "withdrawal" && t.status === "completed") running -= Number(t.amount);
      return { date: new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: running };
    });
  })();

  // Asset allocation from trades
  const allocationData = (() => {
    const assetMap = new Map<string, number>();
    (trades ?? []).filter(t => t.status === "open").forEach(t => {
      const cat = t.asset.includes("/") ? (t.asset.includes("BTC") || t.asset.includes("ETH") || t.asset.includes("SOL") ? "Crypto" : "Forex") : "Stocks";
      assetMap.set(cat, (assetMap.get(cat) ?? 0) + Number(t.amount));
    });
    if (assetMap.size === 0) return [{ name: "No positions", value: 100, color: "hsl(215, 15%, 30%)" }];
    const entries = Array.from(assetMap.entries());
    return entries.map(([name, value], i) => ({ name, value, color: allocationColors[i % allocationColors.length] }));
  })();

  // Recent trades
  const recentTrades = (trades ?? []).slice(0, 5);

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Investor";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground text-sm">Here's your portfolio overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-display font-bold text-foreground">{stat.value}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Balance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(215, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(145, 60%, 45%)" fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Open Positions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {allocationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No trades yet. Start trading to see your activity here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Asset</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Side</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium text-foreground">{trade.asset}</td>
                      <td className={`py-3 ${trade.side === "buy" ? "text-success" : "text-destructive"}`}>{trade.side.charAt(0).toUpperCase() + trade.side.slice(1)}</td>
                      <td className="py-3 text-foreground">${Number(trade.amount).toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${trade.status === "closed" ? "bg-muted text-muted-foreground" : trade.status === "open" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{new Date(trade.created_at).toLocaleDateString()}</td>
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

export default DashboardOverview;
