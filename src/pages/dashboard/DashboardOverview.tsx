import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUp, ArrowDown, DollarSign, TrendingUp, Briefcase, Activity,
  Timer, Zap, Globe, BarChart3, Layers, Gem, Building2, Rocket,
  Bot, CircleDollarSign, Palette, Landmark, Coins, ChevronRight,
  Wallet, Signal, Users, ArrowUpRight, ArrowDownLeft,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useProfitSimulation } from "@/hooks/useProfitSimulation";
import AnimatedBalance from "@/components/dashboard/AnimatedBalance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMarketPrices } from "@/hooks/useMarketPrices";

// ─── Investment Categories ───
const investmentCategories = [
  { name: "Cryptocurrency", description: "BTC, ETH, SOL & 200+ coins", icon: Coins, color: "from-orange-500 to-amber-500", roi: "8-15%", durations: ["1h", "24h", "3d", "7d", "30d"] },
  { name: "Forex Trading", description: "Major & minor currency pairs", icon: Globe, color: "from-blue-500 to-cyan-500", roi: "5-10%", durations: ["1h", "24h", "3d", "7d"] },
  { name: "Stocks", description: "Global company equities", icon: BarChart3, color: "from-green-500 to-emerald-500", roi: "6-12%", durations: ["24h", "3d", "7d", "30d"] },
  { name: "Options Trading", description: "Calls, puts & strategies", icon: Layers, color: "from-purple-500 to-violet-500", roi: "10-20%", durations: ["1h", "24h", "3d"] },
  { name: "ETFs", description: "Diversified index funds", icon: Briefcase, color: "from-teal-500 to-cyan-500", roi: "4-8%", durations: ["7d", "30d"] },
  { name: "Commodities", description: "Gold, silver, oil & more", icon: Gem, color: "from-yellow-500 to-orange-500", roi: "5-9%", durations: ["24h", "3d", "7d", "30d"] },
  { name: "DeFi Investments", description: "Yield farming & staking", icon: CircleDollarSign, color: "from-indigo-500 to-purple-500", roi: "12-25%", durations: ["3d", "7d", "30d"] },
  { name: "NFT Assets", description: "Digital art & collectibles", icon: Palette, color: "from-pink-500 to-rose-500", roi: "15-30%", durations: ["7d", "30d"] },
  { name: "Real Estate", description: "Tokenized property investments", icon: Building2, color: "from-emerald-500 to-green-500", roi: "6-10%", durations: ["30d"] },
  { name: "Startup Equity", description: "Early-stage venture investments", icon: Rocket, color: "from-sky-500 to-blue-500", roi: "20-50%", durations: ["30d"] },
  { name: "AI Trading Bots", description: "Automated algorithmic strategies", icon: Bot, color: "from-violet-500 to-fuchsia-500", roi: "8-18%", durations: ["1h", "24h", "3d", "7d"] },
  { name: "Precious Metals", description: "Physical & digital gold, silver, platinum", icon: Landmark, color: "from-amber-500 to-yellow-500", roi: "4-7%", durations: ["7d", "30d"] },
];

const durationToMs: Record<string, number> = { "1h": 3600000, "24h": 86400000, "3d": 259200000, "7d": 604800000, "30d": 2592000000 };
const durationToLabel: Record<string, string> = { "1h": "1 Hour", "24h": "24 Hours", "3d": "3 Days", "7d": "7 Days", "30d": "30 Days" };
const durationToRate: Record<string, number> = { "1h": 0.5, "24h": 2.5, "3d": 5, "7d": 10, "30d": 25 };

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Completed"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
}

function ActiveInvestmentRow({ inv, getSimulatedValue }: { inv: any; getSimulatedValue?: (inv: any) => number }) {
  const timeLeft = useCountdown(inv.ends_at);
  const startMs = new Date(inv.started_at).getTime();
  const endMs = new Date(inv.ends_at).getTime();
  const elapsed = Math.min(100, Math.max(0, ((Date.now() - startMs) / (endMs - startMs)) * 100));
  const currentValue = getSimulatedValue ? getSimulatedValue(inv) : Number(inv.current_value);
  const profit = currentValue - Number(inv.amount);
  const { format } = useCurrency();
  const fmt = (n: number) => format(n);

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{inv.plan_name}</p>
          <p className="text-xs text-muted-foreground">Invested: {fmt(Number(inv.amount))}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-success">+{fmt(profit)}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Timer className="h-3 w-3" />
            {timeLeft}
          </div>
        </div>
      </div>
      <Progress value={elapsed} className="h-1.5" />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Current: {fmt(currentValue)}</span>
        <span>{elapsed.toFixed(0)}% complete</span>
      </div>
    </div>
  );
}

const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [investDialog, setInvestDialog] = useState<typeof investmentCategories[0] | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [investAmount, setInvestAmount] = useState("");
  const marketAssets = useMarketPrices(8000);
  const cryptoAssets = marketAssets.filter(a => a.source === "binance");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: investments } = useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("investments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profitLogs } = useQuery({
    queryKey: ["profit_logs", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profit_logs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: signalSubs } = useQuery({
    queryKey: ["signal_subscriptions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("signal_subscriptions").select("*").eq("user_id", user!.id).eq("status", "active");
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: copyTrades } = useQuery({
    queryKey: ["copy_trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("user_id", user!.id).eq("status", "open");
      return data ?? [];
    },
    enabled: !!user,
  });

  const investMutation = useMutation({
    mutationFn: async () => {
      if (!investDialog || !selectedDuration || !investAmount) throw new Error("Fill all fields");
      const amt = parseFloat(investAmount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      const walletBal = Number(profile?.wallet_balance ?? 0);
      if (amt > walletBal) throw new Error("Insufficient balance. Please deposit funds first.");
      const durMs = durationToMs[selectedDuration];
      const endsAt = new Date(Date.now() + durMs);
      const rate = durationToRate[selectedDuration];
      const { error } = await supabase.from("investments").insert({
        user_id: user!.id,
        plan_name: `${investDialog.name} (${durationToLabel[selectedDuration]})`,
        amount: amt, current_value: amt, return_pct: 0, daily_rate: rate, status: "active",
        started_at: new Date().toISOString(), ends_at: endsAt.toISOString(),
      });
      if (error) throw error;
      const { error: walletError } = await supabase.from("profiles").update({ wallet_balance: walletBal - amt }).eq("user_id", user!.id);
      if (walletError) throw walletError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Investment placed successfully!");
      setInvestDialog(null); setSelectedDuration(""); setInvestAmount("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const walletBalance = Number(profile?.wallet_balance ?? 0);
  const activeInvestments = (investments ?? []).filter(i => i.status === "active");
  const totalInvested = activeInvestments.reduce((s, i) => s + Number(i.amount), 0);
  const totalCurrentValue = activeInvestments.reduce((s, i) => s + Number(i.current_value), 0);
  const totalProfit = totalCurrentValue - totalInvested + (profitLogs ?? []).reduce((s, l) => s + Number(l.amount), 0);
  const activeSignals = (signalSubs ?? []).filter(s => new Date(s.expires_at) > new Date()).length;
  const activeCopyTrades = (copyTrades ?? []).length;

  const { format } = useCurrency();
  const fmt = (n: number) => format(n);

  // Profit simulation
  const {
    simulatedBalance,
    getSimulatedCurrentValue,
    totalSimulatedProfit,
    walletBonus,
    recentProfits,
    lastFlash,
  } = useProfitSimulation(investments as any, walletBalance);
  const portfolioData = (() => {
    const allTxns = [...(transactions ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (allTxns.length === 0) return [{ date: "Now", value: walletBalance }];
    let running = 0;
    return allTxns.map(t => {
      if (t.type === "deposit" && t.status === "completed") running += Number(t.amount);
      if (t.type === "withdrawal" && t.status === "completed") running -= Number(t.amount);
      return { date: new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: running };
    });
  })();

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Investor";

  const recentTx = (transactions ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, {firstName} 👋</h1>
          <p className="text-muted-foreground text-sm">Here's your portfolio overview</p>
          <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
            <Timer className="h-3 w-3" /> Daily profit is processed at 1:00 AM ({(profile as any)?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/wallet")}>
            <ArrowDownLeft className="h-4 w-4 mr-1" /> Deposit
          </Button>
          <Button className="bg-gradient-brand text-primary-foreground font-semibold" size="sm" onClick={() => navigate("/dashboard/wallet")}>
            <ArrowUpRight className="h-4 w-4 mr-1" /> Withdraw
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/wallet")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Balance</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-display font-bold text-foreground">
              <AnimatedBalance value={simulatedBalance} format={fmt} flash={lastFlash?.type === "profit" ? lastFlash : null} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/portfolio")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Total Profit</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-success/10 text-success">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-display font-bold text-foreground">
              <AnimatedBalance value={totalProfit + totalSimulatedProfit} format={fmt} />
            </div>
            <div className={`flex items-center gap-1 text-xs mt-0.5 ${(totalProfit + totalSimulatedProfit) >= 0 ? "text-success" : "text-destructive"}`}>
              {(totalProfit + totalSimulatedProfit) >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {(totalProfit + totalSimulatedProfit) >= 0 ? "Profit" : "Loss"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/investments")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Investments</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-accent/10 text-accent-foreground">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-display font-bold text-foreground">{activeInvestments.length}</div>
            <p className="text-xs text-muted-foreground">{fmt(totalInvested)} invested</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/copy-trading")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Copy Trades</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-secondary/50 text-secondary-foreground">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-display font-bold text-foreground">{activeCopyTrades}</div>
            <p className="text-xs text-muted-foreground">active allocations</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/signals")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Signals</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Signal className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-display font-bold text-foreground">{activeSignals}</div>
            <p className="text-xs text-muted-foreground">active subscriptions</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/history")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Win Rate</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-success/10 text-success">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-display font-bold text-foreground">{activeInvestments.length > 0 ? "100" : "0"}%</div>
            <p className="text-xs text-muted-foreground">{(investments ?? []).length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: "Invest", icon: Briefcase, to: "/dashboard/investments", color: "bg-primary/10 text-primary" },
          { label: "Copy Trade", icon: Users, to: "/dashboard/copy-trading", color: "bg-secondary/50 text-secondary-foreground" },
          { label: "Signals", icon: Signal, to: "/dashboard/signals", color: "bg-accent/10 text-accent-foreground" },
          { label: "Portfolio", icon: BarChart3, to: "/dashboard/portfolio", color: "bg-success/10 text-success" },
          { label: "Deposit", icon: ArrowDownLeft, to: "/dashboard/wallet", color: "bg-primary/10 text-primary" },
          { label: "Withdraw", icon: ArrowUpRight, to: "/dashboard/wallet", color: "bg-warning/10 text-warning" },
        ].map(action => (
          <Button
            key={action.label}
            variant="outline"
            className="flex flex-col items-center gap-1.5 h-auto py-3 border-border hover:border-primary/30"
            onClick={() => navigate(action.to)}
          >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-[11px] text-foreground">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Live Crypto Prices */}
      {cryptoAssets.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" /> Live Market Prices
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-success border-success/30">● LIVE</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {cryptoAssets.map(asset => {
                const up = asset.change24h >= 0;
                const flash = asset.price > asset.prevPrice ? "border-success/30" : asset.price < asset.prevPrice ? "border-destructive/30" : "border-border/50";
                return (
                  <div key={asset.symbol} className={`p-3 rounded-lg bg-muted/30 border transition-colors ${flash}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{asset.displayName}</span>
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${up ? "border-success/30 text-success" : "border-destructive/30 text-destructive"}`}>
                        {up ? <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDown className="h-2.5 w-2.5 mr-0.5" />}
                        {up ? "+" : ""}{asset.change24h.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="text-sm font-display font-bold text-foreground">
                      ${asset.price < 10 ? asset.price.toFixed(4) : asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Investments with Timers */}
      {activeInvestments.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" /> Active Investments
              </CardTitle>
              <Badge variant="outline" className="text-xs">{activeInvestments.length} active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeInvestments.slice(0, 5).map((inv) => (
              <ActiveInvestmentRow key={inv.id} inv={inv} />
            ))}
            {activeInvestments.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => navigate("/dashboard/investments")}>
                View all {activeInvestments.length} investments <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chart + Recent Activity side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/dashboard/history")}>
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTx.length === 0 && recentProfits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-0">
                {/* Simulated profit entries first */}
                {recentProfits.slice(0, 3).map(sp => {
                  const secsAgo = Math.floor((Date.now() - sp.timestamp) / 1000);
                  const timeLabel = secsAgo < 5 ? "just now" : secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ago`;
                  return (
                    <div key={sp.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center bg-success/10">
                          <TrendingUp className="h-3.5 w-3.5 text-success" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{sp.label}</p>
                          <p className="text-[10px] text-muted-foreground">{timeLabel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-success">+{fmt(sp.amount)}</p>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-success/30 text-success">completed</Badge>
                      </div>
                    </div>
                  );
                })}
                {recentTx.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-success/10" : "bg-warning/10"}`}>
                        {tx.type === "deposit" ? <ArrowDownLeft className="h-3.5 w-3.5 text-success" /> : <ArrowUpRight className="h-3.5 w-3.5 text-warning" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground capitalize">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${tx.type === "deposit" ? "text-success" : "text-foreground"}`}>
                        {tx.type === "deposit" ? "+" : "-"}{fmt(Number(tx.amount))}
                      </p>
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 ${tx.status === "completed" ? "border-success/30 text-success" : tx.status === "pending" ? "border-warning/30 text-warning" : "border-muted-foreground/30"}`}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Profit Payouts */}
      {(profitLogs ?? []).length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-success" /> Recent Profit Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {(profitLogs ?? []).slice(0, 5).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">Daily profit</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-success">+{fmt(Number(log.amount))}</span>
                    <p className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Invest Now</h2>
            <p className="text-xs text-muted-foreground">Choose a category and start earning</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {investmentCategories.map((cat) => (
            <Card
              key={cat.name}
              className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/5"
              onClick={() => { setInvestDialog(cat); setSelectedDuration(cat.durations[0]); }}
            >
              <CardContent className="p-4">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{cat.name}</h3>
                <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-success border-success/30">{cat.roi} ROI</Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Investment History */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Investment History</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/dashboard/history")}>
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(investments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No investments yet. Choose a category above to start earning.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Plan</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Amount</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Profit</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Status</th>
                    <th className="text-right py-2 text-muted-foreground font-medium text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(investments ?? []).slice(0, 10).map((inv) => {
                    const profit = Number(inv.current_value) - Number(inv.amount);
                    return (
                      <tr key={inv.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 font-medium text-foreground text-xs">{inv.plan_name}</td>
                        <td className="py-2.5 text-muted-foreground text-xs">{fmt(Number(inv.amount))}</td>
                        <td className={`py-2.5 text-xs ${profit >= 0 ? "text-success" : "text-destructive"}`}>{profit >= 0 ? "+" : ""}{fmt(profit)}</td>
                        <td className="py-2.5">
                          <Badge variant="outline" className={`text-[10px] ${inv.status === "active" ? "border-success/30 text-success" : "border-muted-foreground/30 text-muted-foreground"}`}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right text-muted-foreground text-xs">{new Date(inv.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invest Dialog */}
      <Dialog open={!!investDialog} onOpenChange={(open) => !open && setInvestDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              {investDialog && (
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${investDialog.color} flex items-center justify-center`}>
                  {investDialog && <investDialog.icon className="h-4 w-4 text-white" />}
                </div>
              )}
              {investDialog?.name}
            </DialogTitle>
            <DialogDescription>{investDialog?.description} · Expected ROI: {investDialog?.roi}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Duration</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {investDialog?.durations.map((d) => (
                  <Button
                    key={d}
                    variant={selectedDuration === d ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${selectedDuration === d ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setSelectedDuration(d)}
                  >
                    {durationToLabel[d]}
                  </Button>
                ))}
              </div>
            </div>
            {selectedDuration && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Expected Return</span>
                  <span className="text-success font-semibold">+{durationToRate[selectedDuration]}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">{durationToLabel[selectedDuration]}</span>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Investment Amount (USD)</label>
              <Input type="number" min="10" placeholder="Enter amount" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} />
              <p className="text-[10px] text-muted-foreground mt-1">Available: {fmt(walletBalance)}</p>
            </div>
            <div className="flex gap-2">
              {["100", "500", "1000", "5000"].map((amt) => (
                <Button key={amt} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setInvestAmount(amt)}>${Number(amt).toLocaleString()}</Button>
              ))}
            </div>
            {investAmount && selectedDuration && (
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Profit</span>
                  <span className="text-success font-bold">+{fmt(parseFloat(investAmount || "0") * durationToRate[selectedDuration] / 100)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Total Return</span>
                  <span className="text-foreground font-semibold">{fmt(parseFloat(investAmount || "0") * (1 + durationToRate[selectedDuration] / 100))}</span>
                </div>
              </div>
            )}
            <Button
              className="w-full bg-gradient-brand text-primary-foreground font-semibold"
              onClick={() => investMutation.mutate()}
              disabled={investMutation.isPending || !selectedDuration || !investAmount}
            >
              {investMutation.isPending ? "Processing..." : `Invest ${investAmount ? fmt(parseFloat(investAmount)) : ""}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardOverview;
