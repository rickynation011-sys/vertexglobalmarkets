import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, Shield, Zap, Crown, Star, Target, Building2, DollarSign, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  { name: "Starter Plan", icon: Shield, returns: "1-2%", annualRate: 1.5, risk: "Low", min: 200, max: 50000, duration: 30, description: "Simple entry-level plan with estimated daily returns based on market conditions.", features: ["Daily interest accrual", "Withdraw after maturity", "Email reports"], popular: false },
  { name: "Growth Plan", icon: Target, returns: "1.5-2.5%", annualRate: 2, risk: "Medium", min: 500, max: 100000, duration: 60, description: "Balanced plan with AI-assisted rebalancing for steady growth.", features: ["AI-assisted rebalancing", "Weekly performance reports", "Priority withdrawals"], popular: true },
  { name: "Advanced Plan", icon: Zap, returns: "2-3%", annualRate: 2.5, risk: "High", min: 1000, max: 200000, duration: 90, description: "Advanced strategies for experienced investors seeking higher potential returns.", features: ["Advanced trading strategies", "Daily analytics", "VIP support"], popular: false },
  { name: "Real Estate Income", icon: Building2, returns: "6-10%", annualRate: 8, risk: "Medium", min: 2500, max: 150000, duration: 90, description: "Earn passive income through diversified global real estate investments and REITs.", features: ["REIT portfolio", "Monthly dividends", "Property diversification"], popular: false },
  { name: "VIP Elite", icon: Crown, returns: "10-15%", annualRate: 12.5, risk: "Variable", min: 25000, max: 1000000, duration: 30, description: "Exclusive strategies with dedicated account management and priority execution.", features: ["Personal manager", "Priority execution", "Custom strategies"], popular: false },
];

const DashboardInvestments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [investAmounts, setInvestAmounts] = useState<Record<string, string>>({});

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
    mutationFn: async ({ planName, amount }: { planName: string; amount: number }) => {
      const { data, error } = await supabase.functions.invoke("create-investment", {
        body: { plan_name: planName, amount },
      });
      if (error) throw new Error(error.message || "Investment failed");
      if (data?.error) {
        // Handle specific error codes
        if (data.error === "NO_BALANCE") {
          toast.error(data.message);
          setTimeout(() => navigate("/dashboard/wallet"), 2000);
          throw new Error(data.message);
        }
        if (data.error === "INSUFFICIENT_BALANCE") {
          throw new Error(data.message);
        }
        throw new Error(data.error);
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["investments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast.success("Investment successful! Your plan has been activated.");
      setInvestAmounts({});
    },
    onError: (e: Error) => {
      if (!e.message.includes("fund your account")) {
        toast.error(e.message);
      }
    },
  });

  const handleInvest = (plan: typeof plans[0]) => {
    const customAmount = investAmounts[plan.name];
    const amount = customAmount ? parseFloat(customAmount) : plan.min;

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid investment amount.");
      return;
    }
    if (amount < plan.min) {
      toast.error(`Minimum investment for ${plan.name} is $${plan.min.toLocaleString()}`);
      return;
    }
    if (amount > plan.max) {
      toast.error(`Maximum investment for ${plan.name} is $${plan.max.toLocaleString()}`);
      return;
    }

    const balance = Number(profile?.wallet_balance ?? 0);
    if (balance <= 0) {
      toast.error("You need to fund your account before purchasing an investment plan.");
      setTimeout(() => navigate("/dashboard/wallet"), 2000);
      return;
    }
    if (balance < amount) {
      toast.error(`Insufficient balance. Please deposit funds to continue.`);
      return;
    }

    investMutation.mutate({ planName: plan.name, amount });
  };

  const activeInvestments = (investments ?? []).filter(i => i.status === "active");
  const totalInvested = activeInvestments.reduce((s, i) => s + Number(i.amount), 0);
  const totalCurrentValue = activeInvestments.reduce((s, i) => s + Number(i.current_value), 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const walletBalance = Number(profile?.wallet_balance ?? 0);

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Investments</h1>
        <p className="text-muted-foreground text-sm">Browse plans and manage active investments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
              <p className="text-xl font-display font-bold text-foreground">{fmt(walletBalance)}</p>
            </div>
          </CardContent>
        </Card>
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
          {plans.map((plan) => {
            const customAmount = investAmounts[plan.name];
            const investAmount = customAmount ? parseFloat(customAmount) : plan.min;
            const dailyEst = (isNaN(investAmount) ? plan.min : investAmount) * plan.annualRate / 100 / 365;

            return (
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
                    <span className="text-success font-medium">{fmt(dailyEst)}/day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Level</span>
                    <Badge variant="outline" className="text-xs">{plan.risk}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min / Max</span>
                    <span className="text-foreground font-medium">${plan.min.toLocaleString()} – ${plan.max.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    {plan.features.map((f) => (
                      <p key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary" /> {f}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    <Input
                      type="number"
                      placeholder={`Amount ($${plan.min.toLocaleString()} - $${plan.max.toLocaleString()})`}
                      value={investAmounts[plan.name] ?? ""}
                      onChange={(e) => setInvestAmounts(prev => ({ ...prev, [plan.name]: e.target.value }))}
                      min={plan.min}
                      max={plan.max}
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground italic">*Profits paid daily to your wallet balance.</p>
                    <Button
                      className="w-full bg-gradient-brand text-primary-foreground font-semibold"
                      size="sm"
                      onClick={() => handleInvest(plan)}
                      disabled={investMutation.isPending}
                    >
                      {investMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                      ) : (
                        `Invest ${fmt(isNaN(investAmount) ? plan.min : investAmount)}`
                      )}
                    </Button>
                    {walletBalance > 0 && walletBalance < plan.min && (
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate("/dashboard/wallet")}>
                        Deposit More Funds
                      </Button>
                    )}
                    {walletBalance <= 0 && (
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate("/dashboard/wallet")}>
                        Deposit Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardInvestments;
