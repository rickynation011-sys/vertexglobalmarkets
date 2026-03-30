import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Signal, Zap, Timer, Copy, Shield, CheckCircle, AlertTriangle,
  TrendingUp, Clock, ChevronRight, BarChart3, Target, Wifi,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DepositMethod {
  id: string;
  currency: string;
  network: string | null;
  wallet_address: string;
  label: string | null;
}

const signalPlans = [
  {
    name: "Basic Signals",
    price: 200,
    features: ["5-10 signals/week", "Major pairs only", "Entry & exit points", "Email alerts"],
    icon: Signal,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro Signals",
    price: 500,
    features: ["15-25 signals/week", "All asset classes", "Risk management levels", "Real-time alerts", "Priority support"],
    icon: Target,
    popular: true,
    color: "from-primary to-accent",
  },
  {
    name: "Elite Signals",
    price: 1000,
    features: ["30+ signals/week", "AI-powered analysis", "Portfolio allocation", "1-on-1 guidance", "VIP group access", "Custom strategies"],
    icon: Zap,
    color: "from-purple-500 to-fuchsia-500",
  },
];

// Signal strength countdown hook
function useSignalStrength(startedAt: string, expiresAt: string) {
  const [strength, setStrength] = useState(100);
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const start = new Date(startedAt).getTime();
      const end = new Date(expiresAt).getTime();
      const now = Date.now();
      const total = end - start;
      const remaining = end - now;

      if (remaining <= 0) {
        setStrength(0);
        setTimeLeft("Expired");
        setExpired(true);
        return;
      }

      const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
      setStrength(Math.round(pct));

      const d = Math.floor(remaining / 86400000);
      const h = Math.floor((remaining % 86400000) / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m`);
      setExpired(false);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [startedAt, expiresAt]);

  return { strength, timeLeft, expired };
}

function ActiveSignalCard({ sub }: { sub: any }) {
  const { strength, timeLeft, expired } = useSignalStrength(sub.started_at, sub.expires_at);

  const strengthColor = expired
    ? "text-destructive"
    : strength > 60
    ? "text-success"
    : strength > 30
    ? "text-warning"
    : "text-destructive";

  const progressColor = expired
    ? "bg-destructive"
    : strength > 60
    ? "bg-success"
    : strength > 30
    ? "bg-warning"
    : "bg-destructive";

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wifi className={`h-4 w-4 ${strengthColor}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{sub.plan_name}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(sub.started_at).toLocaleDateString()} — {new Date(sub.expires_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${expired ? "border-destructive/30 text-destructive" : "border-success/30 text-success"}`}>
            {expired ? "Expired" : "Active"}
          </Badge>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Signal Strength</span>
            <span className={`font-bold ${strengthColor}`}>{strength}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${strength}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Timer className="h-3 w-3" />
            {timeLeft}
          </div>
          <span className="text-muted-foreground">${Number(sub.amount).toLocaleString()} / week</span>
        </div>

        {expired && (
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <p className="text-[11px] text-destructive">Your signal subscription has expired. Please renew to continue receiving trading signals.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const DashboardSignals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [buyDialog, setBuyDialog] = useState<typeof signalPlans[0] | null>(null);
  const [paymentStep, setPaymentStep] = useState<"select" | "pay">("select");
  const [selectedMethodId, setSelectedMethodId] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["signal_subscriptions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("signal_subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: depositMethods } = useQuery({
    queryKey: ["deposit_methods"],
    queryFn: async () => {
      const { data } = await supabase.from("deposit_methods").select("*").eq("is_active", true);
      return (data as DepositMethod[]) ?? [];
    },
  });

  const selectedMethod = (depositMethods ?? []).find(m => m.id === selectedMethodId);

  const purchaseMutation = useMutation({
    mutationFn: async (plan: typeof signalPlans[0]) => {
      if (!selectedMethod) throw new Error("Select a payment method");

      // Create the transaction
      const { data: txn, error: txnError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "deposit",
        method: `${selectedMethod.currency}${selectedMethod.network ? ` (${selectedMethod.network})` : ""}`,
        amount: plan.price,
        currency: selectedMethod.currency,
        status: "pending",
        admin_notes: `Signal purchase: ${plan.name}`,
      }).select("id").single();

      if (txnError) throw txnError;

      // Create the signal subscription (pending until admin approves deposit)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: subError } = await supabase.from("signal_subscriptions").insert({
        user_id: user!.id,
        plan_name: plan.name,
        amount: plan.price,
        status: "pending",
        expires_at: expiresAt.toISOString(),
        transaction_id: txn.id,
      });

      if (subError) throw subError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signal_subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Signal purchase submitted! It will activate once payment is confirmed.");
      setBuyDialog(null);
      setPaymentStep("select");
      setSelectedMethodId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Auto-expire signals that have passed their expiry date
  useEffect(() => {
    const expiredActive = (subscriptions ?? []).filter(
      s => s.status === "active" && new Date(s.expires_at) <= new Date()
    );
    if (expiredActive.length > 0 && user) {
      (async () => {
        for (const sub of expiredActive) {
          await supabase.from("signal_subscriptions").update({ status: "expired" }).eq("id", sub.id);
          // Create expiry notification
          const { data: notif } = await supabase.from("notifications").insert({
            title: "Signal Subscription Expired",
            message: `Your ${sub.plan_name} subscription has expired. Renew to continue receiving signals.`,
            target: "specific",
            target_user_id: user.id,
          }).select("id").single();
          if (notif) {
            await supabase.from("user_notifications").insert({ user_id: user.id, notification_id: notif.id });
          }
        }
        queryClient.invalidateQueries({ queryKey: ["signal_subscriptions"] });
      })();
    }
  }, [subscriptions, user]);

  const activeSubscriptions = (subscriptions ?? []).filter(s => s.status === "active" && new Date(s.expires_at) > new Date());
  const expiredSubscriptions = (subscriptions ?? []).filter(s => s.status === "expired" || (s.status === "active" && new Date(s.expires_at) <= new Date()));
  const pendingSubscriptions = (subscriptions ?? []).filter(s => s.status === "pending");
  const hasActive = activeSubscriptions.length > 0;

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Trading Signals</h1>
          <p className="text-muted-foreground text-sm">Purchase premium signals to boost your trading performance</p>
        </div>
        {hasActive && (
          <Badge className="bg-success/10 text-success border-success/30 w-fit">
            <CheckCircle className="h-3 w-3 mr-1" /> Active Subscription
          </Badge>
        )}
      </div>

      {/* Active Signals */}
      {activeSubscriptions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Wifi className="h-4 w-4 text-success" /> Active Signal Subscriptions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSubscriptions.map(sub => (
              <ActiveSignalCard key={sub.id} sub={sub} />
            ))}
          </div>
        </div>
      )}

      {/* Expired Signals */}
      {expiredSubscriptions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Expired Subscriptions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expiredSubscriptions.map(sub => (
              <ActiveSignalCard key={sub.id} sub={sub} />
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      {pendingSubscriptions.length > 0 && (
        <Card className="bg-card border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Pending Signal Purchases</span>
            </div>
            <div className="space-y-2">
              {pendingSubscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                  <span className="text-foreground">{sub.plan_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{fmt(Number(sub.amount))}</span>
                    <Badge variant="outline" className="text-[10px] border-warning/30 text-warning">Awaiting Confirmation</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signal Plans */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-1">Buy Trading Signals</h2>
        <p className="text-xs text-muted-foreground mb-4">Minimum subscription: $200/week. Signals are delivered in real-time.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signalPlans.map(plan => (
            <Card key={plan.name} className={`bg-card border-border relative hover:border-primary/40 transition-colors ${plan.popular ? "ring-1 ring-primary" : ""}`}>
              {plan.popular && <Badge className="absolute -top-2.5 left-4 bg-gradient-brand text-primary-foreground text-xs">Most Popular</Badge>}
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                    <plan.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-lg font-bold text-foreground">{fmt(plan.price)}<span className="text-xs text-muted-foreground font-normal"> /week</span></p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full font-semibold ${plan.popular ? "bg-gradient-brand text-primary-foreground" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => { setBuyDialog(plan); setPaymentStep("select"); setSelectedMethodId(""); }}
                >
                  Purchase Signal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Purchase History */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Signal Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {(subscriptions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No signal purchases yet. Choose a plan above to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Plan</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Amount</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Status</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Expires</th>
                    <th className="text-right py-2 text-muted-foreground font-medium text-xs">Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {(subscriptions ?? []).map(sub => {
                    const isExpired = new Date(sub.expires_at) <= new Date() && sub.status === "active";
                    return (
                      <tr key={sub.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 font-medium text-foreground text-xs">{sub.plan_name}</td>
                        <td className="py-2.5 text-muted-foreground text-xs">{fmt(Number(sub.amount))}</td>
                        <td className="py-2.5">
                          <Badge variant="outline" className={`text-[10px] ${
                            sub.status === "pending" ? "border-warning/30 text-warning" :
                            isExpired ? "border-destructive/30 text-destructive" :
                            "border-success/30 text-success"
                          }`}>
                            {sub.status === "pending" ? "Pending" : isExpired ? "Expired" : "Active"}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs">{new Date(sub.expires_at).toLocaleDateString()}</td>
                        <td className="py-2.5 text-right text-muted-foreground text-xs">{new Date(sub.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={!!buyDialog} onOpenChange={(open) => { if (!open) { setBuyDialog(null); setPaymentStep("select"); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              {buyDialog && (
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${buyDialog.color} flex items-center justify-center`}>
                  {buyDialog && <buyDialog.icon className="h-4 w-4 text-white" />}
                </div>
              )}
              {buyDialog?.name}
            </DialogTitle>
            <DialogDescription>
              {paymentStep === "select"
                ? `Select your preferred cryptocurrency to pay ${fmt(buyDialog?.price ?? 0)}/week`
                : "Send the exact amount to the wallet address below"}
            </DialogDescription>
          </DialogHeader>

          {paymentStep === "select" ? (
            <div className="space-y-4 mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subscription</span>
                  <span className="text-foreground font-semibold">{buyDialog?.name}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-foreground font-bold">{fmt(buyDialog?.price ?? 0)} / week</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">7 days</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Payment Method</label>
                <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                  <SelectTrigger><SelectValue placeholder="Select cryptocurrency" /></SelectTrigger>
                  <SelectContent>
                    {(depositMethods ?? []).length === 0 ? (
                      <SelectItem value="none" disabled>No methods available</SelectItem>
                    ) : (
                      (depositMethods ?? []).map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.currency}{m.network ? ` (${m.network})` : ""}{m.label ? ` — ${m.label}` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-gradient-brand text-primary-foreground font-semibold"
                disabled={!selectedMethodId}
                onClick={() => setPaymentStep("pay")}
              >
                Continue to Payment <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Send exactly</p>
                  <p className="text-2xl font-display font-bold text-foreground">{fmt(buyDialog?.price ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">in {selectedMethod?.currency}{selectedMethod?.network ? ` (${selectedMethod.network})` : ""}</p>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1.5">
                    Deposit Address ({selectedMethod?.currency}):
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-foreground bg-background p-2.5 rounded border border-border break-all">
                      {selectedMethod?.wallet_address}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedMethod?.wallet_address ?? "");
                        toast.success("Wallet address copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedMethod?.network && (
                  <p className="text-[10px] text-warning flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Make sure to use the {selectedMethod.network} network
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground">After sending, click "Confirm Payment" below. Your signal subscription will activate once payment is verified by our team.</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setPaymentStep("select")}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-brand text-primary-foreground font-semibold"
                  onClick={() => buyDialog && purchaseMutation.mutate(buyDialog)}
                  disabled={purchaseMutation.isPending}
                >
                  {purchaseMutation.isPending ? "Processing..." : "Confirm Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardSignals;
