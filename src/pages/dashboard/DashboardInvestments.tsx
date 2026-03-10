import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap, Crown, Star, Target, Building2, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const plans = [
  { name: "Conservative Growth", icon: Shield, returns: "4-6%", annualRate: 5, risk: "Low", min: 500, duration: 30, description: "Stable returns through diversified bonds, ETFs, and blue-chip stocks.", features: ["AI Risk Management", "Auto-rebalancing", "Daily reports"], popular: false },
  { name: "Balanced Portfolio", icon: Target, returns: "6-9%", annualRate: 7.5, risk: "Medium", min: 2000, duration: 30, description: "Mix of growth stocks, forex, and crypto for balanced risk-reward.", features: ["Multi-asset exposure", "Smart hedging", "Weekly analytics"], popular: true },
  { name: "Aggressive Alpha", icon: Zap, returns: "8-12%", annualRate: 10, risk: "High", min: 5000, duration: 30, description: "High-frequency algorithmic trading across volatile markets.", features: ["AI signal trading", "Leveraged positions", "Real-time alerts"], popular: false },
  { name: "Forex Specialist", icon: TrendingUp, returns: "5-8%", annualRate: 6.5, risk: "Medium", min: 1000, duration: 30, description: "Dedicated forex strategy across major and minor currency pairs.", features: ["24/5 trading", "News-driven AI", "Spread optimization"], popular: false },
  { name: "Crypto Momentum", icon: Star, returns: "7-12%", annualRate: 9.5, risk: "High", min: 1500, duration: 30, description: "Capitalize on crypto market trends using AI momentum indicators.", features: ["Top 20 cryptos", "DeFi yield", "Auto stop-loss"], popular: false },
  { name: "Real Estate Income", icon: Building2, returns: "6-10%", annualRate: 8, risk: "Medium", min: 2500, duration: 90, description: "Earn passive income through diversified global real estate investments and REITs.", features: ["REIT portfolio", "Monthly dividends", "Property diversification"], popular: false },
  { name: "VIP Elite", icon: Crown, returns: "10-15%", annualRate: 12.5, risk: "Variable", min: 25000, duration: 30, description: "Exclusive strategies with dedicated account management and priority execution.", features: ["Personal manager", "Priority execution", "Custom strategies"], popular: false },
];

const DashboardInvestments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: investments } = useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("investments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profitLogs } = useQuery({
    queryKey: ["profit_logs", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profit_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!user,
  });

  const investMutation = useMutation({
    mutationFn: async (plan: typeof plans[0]) => {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + plan.duration);
      const { error } = await supabase.from("investments").insert({
        user_id: user!.id,
        plan_name: plan.name,
        amount: plan.min,
        current_value: plan.min,
        return_pct: 0,
        daily_rate: plan.annualRate,
        status: "active",
        ends_at: endsAt.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_, plan) => {
      queryClient.invalidateQueries({ queryKey: ["investments", user?.id] });
      toast.success(`Invested $${plan.min.toLocaleString()} in ${plan.name}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeInvestments = (investments ?? []).filter(i => i.status === "active");
  const totalInvested = activeInvestments.reduce((s, i) => s + Number(i.amount), 0);
  const totalCurrentValue = activeInvestments.reduce((s, i) => s + Number(i.current_value), 0);
  const totalProfit = totalCurrentValue - totalInvested;

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Investments</h1>
        <p className="text-muted-foreground text-sm">Browse plans and manage active investments</p>
      </div>

      {/* Profit Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-xl font-display font-bold text-foreground">{fmt(totalInvested)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="text-xl font-display font-bold text-success">{fmt(totalCurrentValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Profit</p>
              <p className={`text-xl font-display font-bold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>{fmt(totalProfit)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
        </CardHeader>
        <CardContent>
          {activeInvestments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active investments. Choose a plan below to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Plan</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Invested</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Current</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Daily Profit</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Return</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvestments.map((inv) => {
                    const daysLeft = Math.max(0, Math.ceil((new Date(inv.ends_at).getTime() - Date.now()) / 86400000));
                    const dailyProfit = Number(inv.amount) * (Number(inv.daily_rate ?? 0) / 365);
                    return (
                      <tr key={inv.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-medium text-foreground">{inv.plan_name}</td>
                        <td className="py-3 text-muted-foreground">{fmt(Number(inv.amount))}</td>
                        <td className="py-3 text-foreground">{fmt(Number(inv.current_value))}</td>
                        <td className="py-3 text-success">+{fmt(dailyProfit)}/day</td>
                        <td className="py-3 text-success">+{Number(inv.return_pct).toFixed(2)}%</td>
                        <td className="py-3 text-right text-muted-foreground">{daysLeft} days</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Profit Logs */}
      {(profitLogs ?? []).length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Profit Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {(profitLogs ?? []).slice(0, 10).map((log: any) => (
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

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-card border-border relative ${plan.popular ? "ring-1 ring-primary" : ""}`}>
              {plan.popular && <Badge className="absolute -top-2.5 left-4 bg-gradient-brand text-primary-foreground text-xs">Most Popular</Badge>}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <plan.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual Rate</span>
                  <span className="text-success font-semibold">{plan.annualRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily Profit (est.)</span>
                  <span className="text-success font-medium">{fmt(plan.min * plan.annualRate / 100 / 365)}/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Level</span>
                  <Badge variant="outline" className="text-xs">{plan.risk}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum</span>
                  <span className="text-foreground font-medium">${plan.min.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  {plan.features.map((f) => (
                    <p key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary" /> {f}
                    </p>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic">*Profits paid daily to your wallet balance.</p>
                <Button className="w-full bg-gradient-brand text-primary-foreground font-semibold" size="sm" onClick={() => investMutation.mutate(plan)} disabled={investMutation.isPending}>
                  Invest ${plan.min.toLocaleString()}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardInvestments;
