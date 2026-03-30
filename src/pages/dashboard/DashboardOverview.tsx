import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUp, ArrowDown, DollarSign, TrendingUp, Briefcase,
  Timer, Globe, BarChart3, Layers, Gem, Building2, Rocket,
  Bot, CircleDollarSign, Palette, Landmark, Coins, ChevronRight,
  Wallet, Signal, Users, ArrowUpRight, ArrowDownLeft, ShieldCheck,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import BalanceSparkline from "@/components/dashboard/BalanceSparkline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMarketPrices } from "@/hooks/useMarketPrices";

// ─── Investment Categories ───
const investmentCategories = [
  { name: "Cryptocurrency", description: "BTC, ETH, SOL & 200+ coins", icon: Coins, color: "from-orange-500 to-amber-500", durations: ["1h", "24h", "3d", "7d", "30d"] },
  { name: "Forex Trading", description: "Major & minor currency pairs", icon: Globe, color: "from-blue-500 to-cyan-500", durations: ["1h", "24h", "3d", "7d"] },
  { name: "Stocks", description: "Global company equities", icon: BarChart3, color: "from-green-500 to-emerald-500", durations: ["24h", "3d", "7d", "30d"] },
  { name: "Options Trading", description: "Calls, puts & strategies", icon: Layers, color: "from-purple-500 to-violet-500", durations: ["1h", "24h", "3d"] },
  { name: "ETFs", description: "Diversified index funds", icon: Briefcase, color: "from-teal-500 to-cyan-500", durations: ["7d", "30d"] },
  { name: "Commodities", description: "Gold, silver, oil & more", icon: Gem, color: "from-yellow-500 to-orange-500", durations: ["24h", "3d", "7d", "30d"] },
  { name: "DeFi", description: "Yield farming & staking", icon: CircleDollarSign, color: "from-indigo-500 to-purple-500", durations: ["3d", "7d", "30d"] },
  { name: "NFT Assets", description: "Digital art & collectibles", icon: Palette, color: "from-pink-500 to-rose-500", durations: ["7d", "30d"] },
  { name: "Real Estate", description: "Tokenized property investments", icon: Building2, color: "from-emerald-500 to-green-500", durations: ["30d"] },
  { name: "Startup Equity", description: "Early-stage venture investments", icon: Rocket, color: "from-sky-500 to-blue-500", durations: ["30d"] },
  { name: "Algo Strategies", description: "Automated algorithmic trading", icon: Bot, color: "from-violet-500 to-fuchsia-500", durations: ["1h", "24h", "3d", "7d"] },
  { name: "Precious Metals", description: "Physical & digital gold, silver, platinum", icon: Landmark, color: "from-amber-500 to-yellow-500", durations: ["7d", "30d"] },
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

function ActiveInvestmentRow({ inv }: { inv: any }) {
  const timeLeft = useCountdown(inv.ends_at);
  const startMs = new Date(inv.started_at).getTime();
  const endMs = new Date(inv.ends_at).getTime();
  const elapsed = Math.min(100, Math.max(0, ((Date.now() - startMs) / (endMs - startMs)) * 100));
  const currentValue = Number(inv.current_value);
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
          <p className={`text-sm font-semibold ${profit >= 0 ? "text-success" : "text-destructive"}`}>{profit >= 0 ? "+" : ""}{fmt(profit)}</p>
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
      const { data } = await supabase.from("profit_logs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
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

  const { data: kycStatus } = useQuery({
    queryKey: ["kyc_status", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("kyc_verifications").select("status").eq("user_id", user!.id).order("submitted_at", { ascending: false }).limit(1).maybeSingle();
      return data?.status || null;
    },
    enabled: !!user,
  });

  const { data: allTrades } = useQuery({
    queryKey: ["all_trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const investMutation = useMutation({
    mutationFn: async () => {
      if (!investDialog || !selectedDuration || !investAmount) throw new Error("Fill all fields");
      const amt = parseFloat(investAmount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      const planName = `${investDialog.name} (${durationToLabel[selectedDuration]})`;
      const { data, error } = await supabase.functions.invoke("create-investment", {
        body: { plan_name: planName, amount: amt },
      });
      if (error) throw new Error(error.message || "Investment failed");
      if (data?.error) {
        if (data.error === "NO_BALANCE") {
          toast.error(data.message);
          setTimeout(() => navigate("/dashboard/wallet"), 2000);
          throw new Error(data.message);
        }
        if (data.error === "INSUFFICIENT_BALANCE") throw new Error(data.message);
        throw new Error(data.error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Investment placed successfully!");
      setInvestDialog(null); setSelectedDuration(""); setInvestAmount("");
    },
    onError: (e: Error) => {
      if (!e.message.includes("fund your account")) toast.error(e.message);
    },
  });

  const walletBalance = Number(profile?.wallet_balance ?? 0);
  const activeInvestments = (investments ?? []).filter(i => i.status === "active");
  const totalInvested = activeInvestments.reduce((s, i) => s + Number(i.amount), 0);
  const totalCurrentValue = activeInvestments.reduce((s, i) => s + Number(i.current_value), 0);
  // Investment Profit = sum of all profit_logs (daily payouts from investments)
  const totalProfitFromLogs = (profitLogs ?? []).reduce((s, l) => s + Number(l.amount), 0);
  const investmentProfit = totalProfitFromLogs;
  // Trade P&L from closed trades
  const tradePnl = (allTrades ?? []).filter(t => t.status === "closed").reduce((s, t) => s + Number(t.pnl ?? 0), 0);
  // Admin adjustments (credits - debits)
  const isSuccessful = (status: string) => status === "completed" || status === "approved";
  const adminCredits = (transactions ?? []).filter(t => t.type === "admin_credit" && isSuccessful(t.status)).reduce((s, t) => s + Number(t.amount), 0);
  const adminDebits = (transactions ?? []).filter(t => t.type === "admin_debit" && isSuccessful(t.status)).reduce((s, t) => s + Number(t.amount), 0);
  // Total Profit = investment profits + trade P&L + admin adjustments
  const totalProfit = investmentProfit + tradePnl + adminCredits - adminDebits;
  const activeSignals = (signalSubs ?? []).filter(s => new Date(s.expires_at) > new Date()).length;
  const activeCopyTrades = (copyTrades ?? []).length;

  // Win rate from real closed trades
  const closedTrades = (allTrades ?? []).filter(t => t.status === "closed");
  const winCount = closedTrades.filter(t => Number(t.pnl ?? 0) > 0).length;
  const winRate = closedTrades.length > 0 ? Math.round((winCount / closedTrades.length) * 100) : 0;

  const { format } = useCurrency();
  const fmt = (n: number) => format(n);

  // Build real balance history from transactions + profit logs for sparkline
  const balanceHistory = (() => {
    const events: { date: number; delta: number }[] = [];
    (transactions ?? []).forEach(t => {
      if (t.type === "deposit" && (t.status === "completed" || t.status === "approved"))
        events.push({ date: new Date(t.created_at).getTime(), delta: Number(t.amount) });
      if (t.type === "withdrawal" && (t.status === "completed" || t.status === "approved"))
        events.push({ date: new Date(t.created_at).getTime(), delta: -Number(t.amount) });
    });
    (profitLogs ?? []).forEach(l => {
      events.push({ date: new Date(l.created_at).getTime(), delta: Number(l.amount) });
    });
    events.sort((a, b) => a.date - b.date);
    if (events.length === 0) return [walletBalance];
    let running = 0;
    const points = events.map(e => { running += e.delta; return running; });
    // Ensure last point matches current wallet balance
    points.push(walletBalance);
    return points.slice(-30);
  })();

  const isSuccessful = (status: string) => status === "completed" || status === "approved";

  const totalDeposited = (transactions ?? []).filter(t => t.type === "deposit" && isSuccessful(t.status)).reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawn = (transactions ?? []).filter(t => t.type === "withdrawal" && isSuccessful(t.status)).reduce((s, t) => s + Number(t.amount), 0);
  // wallet_balance is already net of invested amounts (deducted at investment time)
  const availableBalance = walletBalance;

  const portfolioData = (() => {
    const allTxns = [...(transactions ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (allTxns.length === 0) return [{ date: "Now", value: walletBalance }];
    let running = 0;
    return allTxns.map(t => {
      if (t.type === "deposit" && isSuccessful(t.status)) running += Number(t.amount);
      if (t.type === "withdrawal" && isSuccessful(t.status)) running -= Number(t.amount);
      return { date: new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: running };
    });
  })();

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";
  const recentTx = (transactions ?? []).slice(0, 5);




  const kycLabel = kycStatus === "approved" ? "Verified" : kycStatus === "pending" ? "Pending" : "Not Verified";
  const kycColor = kycStatus === "approved" ? "border-success/30 text-success" : kycStatus === "pending" ? "border-warning/30 text-warning" : "border-muted-foreground/30 text-muted-foreground";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground text-sm">Monitor your account and stay updated on your activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] ${kycColor}`}>
            <ShieldCheck className="h-3 w-3 mr-1" />
            KYC: {kycLabel}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/wallet")}>
            <ArrowDownLeft className="h-4 w-4 mr-1" /> Deposit
          </Button>
          <Button className="bg-gradient-brand text-primary-foreground font-semibold" size="sm" onClick={() => navigate("/dashboard/wallet")}>
            <ArrowUpRight className="h-4 w-4 mr-1" /> Withdraw
          </Button>
        </div>
      </div>

      {/* Removed simulated milestone - only real DB data */}

      {/* Account Summary - Broker Style */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/wallet")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Balance</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-lg font-display font-bold text-foreground">
                {fmt(walletBalance)}
              </div>
              <BalanceSparkline data={balanceHistory} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Total Deposited</span>
              <ArrowDown className="h-4 w-4 text-success" />
            </div>
            <div className="text-lg font-display font-bold text-success">{fmt(totalDeposited)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Total Withdrawn</span>
              <ArrowUp className="h-4 w-4 text-warning" />
            </div>
            <div className="text-lg font-display font-bold text-foreground">{fmt(totalWithdrawn)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Investment Profit</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className={`text-lg font-display font-bold ${investmentProfit >= 0 ? "text-success" : "text-destructive"}`}>
              {investmentProfit >= 0 ? "+" : ""}{fmt(investmentProfit)}
            </div>
            <p className="text-[10px] text-muted-foreground">{activeInvestments.length} active plans</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/portfolio")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">P&L</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className={`text-lg font-display font-bold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
              {totalProfit >= 0 ? "+" : ""}{fmt(totalProfit)}
            </div>
            <div className={`flex items-center gap-1 text-[10px] ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
              {totalProfit >= 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
              Total P&L
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-[10px] text-muted-foreground/50 text-center">Performance updates are based on market conditions and may vary. Past results do not guarantee future outcomes.</p>

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

      {/* Market Watch */}
      {cryptoAssets.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" /> Market Watch
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

      {/* Open Positions / Active Investments */}
      {activeInvestments.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" /> Open Positions
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
                View all {activeInvestments.length} positions <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chart + Recent Transactions */}
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

        {/* Recent Transactions */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/dashboard/history")}>
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTx.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
            ) : (
              <div className="space-y-0">
                {recentTx.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-success/10" : "bg-warning/10"}`}>
                        {tx.type === "deposit" ? <ArrowDownLeft className="h-3.5 w-3.5 text-success" /> : <ArrowUpRight className="h-3.5 w-3.5 text-warning" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground capitalize">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${tx.type === "deposit" ? "text-success" : "text-foreground"}`}>
                        {tx.type === "deposit" ? "+" : "-"}{fmt(Number(tx.amount))}
                      </p>
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 ${(tx.status === "completed" || tx.status === "approved") ? "border-success/30 text-success" : tx.status === "pending" ? "border-warning/30 text-warning" : "border-muted-foreground/30"}`}>
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
              <TrendingUp className="h-4 w-4 text-success" /> Account Activity
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
                    <span className="text-sm text-muted-foreground">Investment return</span>
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
            <h2 className="text-lg font-display font-semibold text-foreground">Investment Options</h2>
            <p className="text-xs text-muted-foreground">Choose a category to explore. All investments involve risk.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {investmentCategories.map((cat) => (
            <Card
              key={cat.name}
              className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group"
              onClick={() => { setInvestDialog(cat); setSelectedDuration(cat.durations[0]); }}
            >
              <CardContent className="p-4">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3`}>
                  <cat.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{cat.name}</h3>
                <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{cat.description}</p>
                <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
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
            <p className="text-sm text-muted-foreground text-center py-6">No investments yet. Choose a category above to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Plan</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Amount</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">P&L</th>
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
            <DialogDescription>{investDialog?.description}</DialogDescription>
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
            <p className="text-[10px] text-muted-foreground">Returns depend on market conditions and are not guaranteed. You may lose part or all of your capital.</p>
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
