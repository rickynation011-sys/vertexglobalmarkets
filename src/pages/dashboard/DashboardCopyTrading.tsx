import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Users, TrendingUp, Shield, Star, ArrowUp, ArrowDown,
  Copy, DollarSign, BarChart3, Target, Zap, ChevronRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Simulated top traders
const topTraders = [
  {
    id: "trader-1", name: "Alex Morgan", avatar: "AM", winRate: 92, totalProfit: 284500, riskLevel: "Low",
    followers: 1243, description: "Conservative forex & crypto strategy", minAllocation: 200,
    monthlyReturn: 8.5, drawdown: 4.2,
    performance: [
      { month: "Jan", pnl: 4200 }, { month: "Feb", pnl: 5100 }, { month: "Mar", pnl: 3800 },
      { month: "Apr", pnl: 6400 }, { month: "May", pnl: 7200 }, { month: "Jun", pnl: 5900 },
    ],
  },
  {
    id: "trader-2", name: "Sarah Chen", avatar: "SC", winRate: 88, totalProfit: 512000, riskLevel: "Medium",
    followers: 2105, description: "Aggressive momentum trading on crypto markets", minAllocation: 500,
    monthlyReturn: 12.3, drawdown: 8.1,
    performance: [
      { month: "Jan", pnl: 8100 }, { month: "Feb", pnl: 11200 }, { month: "Mar", pnl: -2300 },
      { month: "Apr", pnl: 14500 }, { month: "May", pnl: 9800 }, { month: "Jun", pnl: 12100 },
    ],
  },
  {
    id: "trader-3", name: "James Wilson", avatar: "JW", winRate: 95, totalProfit: 178000, riskLevel: "Low",
    followers: 876, description: "Steady ETF & index fund strategies", minAllocation: 100,
    monthlyReturn: 5.2, drawdown: 2.1,
    performance: [
      { month: "Jan", pnl: 2800 }, { month: "Feb", pnl: 3100 }, { month: "Mar", pnl: 2600 },
      { month: "Apr", pnl: 3500 }, { month: "May", pnl: 3200 }, { month: "Jun", pnl: 3800 },
    ],
  },
  {
    id: "trader-4", name: "Maria Rodriguez", avatar: "MR", winRate: 85, totalProfit: 723000, riskLevel: "High",
    followers: 3421, description: "High-frequency algorithmic trading across all markets", minAllocation: 1000,
    monthlyReturn: 18.7, drawdown: 14.5,
    performance: [
      { month: "Jan", pnl: 15200 }, { month: "Feb", pnl: 22100 }, { month: "Mar", pnl: -5600 },
      { month: "Apr", pnl: 28400 }, { month: "May", pnl: 19300 }, { month: "Jun", pnl: 24800 },
    ],
  },
  {
    id: "trader-5", name: "David Kim", avatar: "DK", winRate: 90, totalProfit: 345000, riskLevel: "Medium",
    followers: 1587, description: "Multi-strategy forex pairs with AI-driven signals", minAllocation: 300,
    monthlyReturn: 9.8, drawdown: 6.3,
    performance: [
      { month: "Jan", pnl: 5400 }, { month: "Feb", pnl: 7200 }, { month: "Mar", pnl: 4100 },
      { month: "Apr", pnl: 8900 }, { month: "May", pnl: 6700 }, { month: "Jun", pnl: 7800 },
    ],
  },
  {
    id: "trader-6", name: "Emma Thompson", avatar: "ET", winRate: 87, totalProfit: 198000, riskLevel: "Low",
    followers: 952, description: "DeFi yield optimization and staking", minAllocation: 250,
    monthlyReturn: 7.1, drawdown: 3.8,
    performance: [
      { month: "Jan", pnl: 3600 }, { month: "Feb", pnl: 4200 }, { month: "Mar", pnl: 3900 },
      { month: "Apr", pnl: 5100 }, { month: "May", pnl: 4800 }, { month: "Jun", pnl: 5500 },
    ],
  },
];

const riskColors: Record<string, string> = {
  Low: "border-success/30 text-success",
  Medium: "border-warning/30 text-warning",
  High: "border-destructive/30 text-destructive",
};

const DashboardCopyTrading = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTrader, setSelectedTrader] = useState<typeof topTraders[0] | null>(null);
  const [allocAmount, setAllocAmount] = useState("");

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

  const { data: activeCopyTrades } = useQuery({
    queryKey: ["copy-trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user!.id)
        .like("asset", "COPY:%")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: copyHistory } = useQuery({
    queryKey: ["copy-history", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user!.id)
        .like("asset", "COPY:%")
        .eq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!user,
  });

  const copyMutation = useMutation({
    mutationFn: async (trader: typeof topTraders[0]) => {
      const amt = parseFloat(allocAmount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (amt < trader.minAllocation) throw new Error(`Minimum allocation is $${trader.minAllocation}`);
      const walletBalance = Number(profile?.wallet_balance ?? 0);
      if (amt > walletBalance) throw new Error("Insufficient balance. Please deposit funds first.");

      // Create a copy trade as a special trade
      const { error } = await supabase.from("trades").insert({
        user_id: user!.id,
        asset: `COPY:${trader.name}`,
        side: "buy",
        amount: amt,
        price: null,
        status: "open",
      });
      if (error) throw error;

      // Deduct from wallet
      const { error: walletErr } = await supabase.from("profiles")
        .update({ wallet_balance: walletBalance - amt })
        .eq("user_id", user!.id);
      if (walletErr) throw walletErr;
    },
    onSuccess: (_, trader) => {
      queryClient.invalidateQueries({ queryKey: ["copy-trades"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(`Successfully allocated funds to ${trader.name}!`);
      setSelectedTrader(null);
      setAllocAmount("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stopCopyMutation = useMutation({
    mutationFn: async (tradeId: string) => {
      const trade = (activeCopyTrades ?? []).find(t => t.id === tradeId);
      if (!trade) throw new Error("Trade not found");

      // Close the trade and return funds
      const { error } = await supabase.from("trades")
        .update({ status: "closed", closed_at: new Date().toISOString(), pnl: 0 })
        .eq("id", tradeId);
      if (error) throw error;

      // Return funds to wallet
      const walletBalance = Number(profile?.wallet_balance ?? 0);
      const { error: walletErr } = await supabase.from("profiles")
        .update({ wallet_balance: walletBalance + Number(trade.amount) })
        .eq("user_id", user!.id);
      if (walletErr) throw walletErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["copy-trades"] });
      queryClient.invalidateQueries({ queryKey: ["copy-history"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Copy trade stopped. Funds returned to wallet.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const walletBalance = Number(profile?.wallet_balance ?? 0);
  const totalAllocated = (activeCopyTrades ?? []).reduce((s, t) => s + Number(t.amount), 0);
  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Copy Trading</h1>
        <p className="text-muted-foreground text-sm">Follow top traders and automatically replicate their strategies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Allocated</p>
              <p className="text-xl font-display font-bold text-foreground">{fmt(totalAllocated)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Copy Trades</p>
              <p className="text-xl font-display font-bold text-foreground">{(activeCopyTrades ?? []).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-xl font-display font-bold text-foreground">{fmt(walletBalance)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Copy Trades */}
      {(activeCopyTrades ?? []).length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Copy className="h-4 w-4 text-primary" /> Active Copy Trades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(activeCopyTrades ?? []).map(trade => {
              const traderName = trade.asset.replace("COPY:", "");
              return (
                <div key={trade.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {traderName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{traderName}</p>
                      <p className="text-xs text-muted-foreground">Allocated: {fmt(Number(trade.amount))}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => stopCopyMutation.mutate(trade.id)}
                    disabled={stopCopyMutation.isPending}
                  >
                    Stop Copy
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Top Traders */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-1">Top Traders</h2>
        <p className="text-xs text-muted-foreground mb-4">Choose a trader to copy and allocate your funds</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {topTraders.map(trader => (
            <Card key={trader.id} className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group" onClick={() => { setSelectedTrader(trader); setAllocAmount(""); }}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
                    {trader.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-display font-semibold text-foreground">{trader.name}</h3>
                      {trader.winRate >= 90 && <Star className="h-3.5 w-3.5 text-warning fill-warning" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{trader.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Win Rate</p>
                    <p className="text-sm font-bold text-success">{trader.winRate}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Monthly Return</p>
                    <p className="text-sm font-bold text-success">+{trader.monthlyReturn}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Total Profit</p>
                    <p className="text-sm font-bold text-foreground">{fmt(trader.totalProfit)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Followers</p>
                    <p className="text-sm font-bold text-foreground">{trader.followers.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-[10px] ${riskColors[trader.riskLevel]}`}>
                    <Shield className="h-3 w-3 mr-1" /> {trader.riskLevel} Risk
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">Min: ${trader.minAllocation}</span>
                </div>

                {/* Mini Chart */}
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={trader.performance}>
                    <defs>
                      <linearGradient id={`grad-${trader.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="pnl" stroke="hsl(var(--primary))" fill={`url(#grad-${trader.id})`} strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>

                <Button className="w-full bg-gradient-brand text-primary-foreground font-semibold" size="sm">
                  <Copy className="h-4 w-4 mr-1" /> Copy Trade
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Copy Trade History */}
      {(copyHistory ?? []).length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Copy Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Trader</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Amount</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">P&L</th>
                    <th className="text-right py-2 text-muted-foreground font-medium text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(copyHistory ?? []).map(trade => (
                    <tr key={trade.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-medium text-foreground text-xs">{trade.asset.replace("COPY:", "")}</td>
                      <td className="py-2.5 text-muted-foreground text-xs">{fmt(Number(trade.amount))}</td>
                      <td className={`py-2.5 text-xs ${Number(trade.pnl ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                        {Number(trade.pnl ?? 0) >= 0 ? "+" : ""}{fmt(Number(trade.pnl ?? 0))}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground text-xs">{new Date(trade.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Copy Trade Dialog */}
      <Dialog open={!!selectedTrader} onOpenChange={(open) => !open && setSelectedTrader(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedTrader && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 font-display">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
                    {selectedTrader.avatar}
                  </div>
                  Copy {selectedTrader.name}
                </DialogTitle>
                <DialogDescription>{selectedTrader.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Trader Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground">Win Rate</p>
                    <p className="text-sm font-bold text-success">{selectedTrader.winRate}%</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground">Monthly Return</p>
                    <p className="text-sm font-bold text-success">+{selectedTrader.monthlyReturn}%</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground">Max Drawdown</p>
                    <p className="text-sm font-bold text-destructive">-{selectedTrader.drawdown}%</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground">Risk Level</p>
                    <Badge variant="outline" className={`text-[10px] mt-0.5 ${riskColors[selectedTrader.riskLevel]}`}>
                      {selectedTrader.riskLevel}
                    </Badge>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">6-Month Performance</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={selectedTrader.performance}>
                      <defs>
                        <linearGradient id="copyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))", fontSize: "12px" }} formatter={(v: number) => [fmt(v), "P&L"]} />
                      <Area type="monotone" dataKey="pnl" stroke="hsl(var(--primary))" fill="url(#copyGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Allocation Amount */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Allocation Amount (USD)</label>
                  <Input type="number" min={selectedTrader.minAllocation} placeholder={`Min $${selectedTrader.minAllocation}`} value={allocAmount} onChange={e => setAllocAmount(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">Available: {fmt(walletBalance)}</p>
                </div>
                <div className="flex gap-2">
                  {[String(selectedTrader.minAllocation), "500", "1000", "5000"].map(amt => (
                    <Button key={amt} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setAllocAmount(amt)}>
                      ${Number(amt).toLocaleString()}
                    </Button>
                  ))}
                </div>

                {allocAmount && parseFloat(allocAmount) >= selectedTrader.minAllocation && (
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Monthly Return</span>
                      <span className="text-success font-bold">+{fmt(parseFloat(allocAmount) * selectedTrader.monthlyReturn / 100)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-brand text-primary-foreground font-semibold"
                  onClick={() => copyMutation.mutate(selectedTrader)}
                  disabled={copyMutation.isPending || !allocAmount}
                >
                  {copyMutation.isPending ? "Processing..." : `Copy Trade ${allocAmount ? fmt(parseFloat(allocAmount)) : ""}`}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCopyTrading;
