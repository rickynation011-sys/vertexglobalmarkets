import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownLeft, ArrowUpRight, Wallet, Shield, Copy, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import WithdrawalFeeDialog from "@/components/dashboard/WithdrawalFeeDialog";

interface DepositMethod {
  id: string;
  currency: string;
  network: string | null;
  wallet_address: string;
  label: string | null;
}

const DashboardWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethodId, setDepositMethodId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethodId, setWithdrawMethodId] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
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

  const { data: depositMethods } = useQuery({
    queryKey: ["deposit_methods"],
    queryFn: async () => {
      const { data } = await supabase
        .from("deposit_methods")
        .select("*")
        .eq("is_active", true);
      return (data as DepositMethod[]) ?? [];
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
        .limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profitLogsAll } = useQuery({
    queryKey: ["total_profit", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profit_logs").select("amount").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: feePayments } = useQuery({
    queryKey: ["fee_payments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("fee_payments").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const completedDeposits = (transactions ?? []).filter(t => t.type === "deposit" && t.status === "completed");
  const completedWithdrawals = (transactions ?? []).filter(t => t.type === "withdrawal" && t.status === "completed");
  const totalDeposited = completedDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawn = completedWithdrawals.reduce((s, t) => s + Number(t.amount), 0);
  const walletBalance = Number(profile?.wallet_balance ?? 0);

  const totalProfit = (profitLogsAll ?? []).reduce((s, l) => s + Number(l.amount), 0);
  const processingFee = totalProfit * 0.10;
  const hasFeeApproved = (feePayments ?? []).some((p: any) => p.status === "approved");

  const selectedDepositMethod = (depositMethods ?? []).find(m => m.id === depositMethodId);
  const selectedWithdrawMethod = (depositMethods ?? []).find(m => m.id === withdrawMethodId);

  const depositMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(depositAmount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (!selectedDepositMethod) throw new Error("Select a payment method");
      const method = `${selectedDepositMethod.currency}${selectedDepositMethod.network ? ` (${selectedDepositMethod.network})` : ""}`;
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "deposit",
        method,
        amount: amt,
        currency: selectedDepositMethod.currency,
        status: "pending",
      });
      if (error) throw error;

      // Send deposit confirmation email to user
      const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("user_id", user!.id).single();
      if (prof?.email) {
        supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'deposit-confirmation',
            recipientEmail: prof.email,
            idempotencyKey: `deposit-request-${user!.id}-${Date.now()}`,
            templateData: { name: prof.full_name || undefined, amount: amt.toLocaleString('en-US', { minimumFractionDigits: 2 }), method },
          },
        });
      }

      // Notify admin(s) about the new deposit
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (adminRoles && adminRoles.length > 0) {
        const { data: adminProfiles } = await supabase.from("profiles").select("email").in("user_id", adminRoles.map(r => r.user_id));
        for (const admin of adminProfiles ?? []) {
          if (admin.email) {
            supabase.functions.invoke('send-transactional-email', {
              body: {
                templateName: 'admin-new-deposit',
                recipientEmail: admin.email,
                idempotencyKey: `admin-deposit-${user!.id}-${Date.now()}-${admin.email}`,
                templateData: {
                  userName: prof?.full_name || 'Unknown',
                  userEmail: prof?.email || user!.email || '',
                  amount: amt.toLocaleString('en-US', { minimumFractionDigits: 2 }),
                  method,
                  currency: selectedDepositMethod.currency,
                  submittedAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast.success("Deposit request submitted. It will be reviewed shortly.");
      setDepositAmount("");
      setDepositMethodId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleWithdrawClick = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!selectedWithdrawMethod) { toast.error("Select a withdrawal method"); return; }
    if (!withdrawWallet.trim()) { toast.error("Enter your wallet address"); return; }
    if (amt > walletBalance) { toast.error("Insufficient balance"); return; }

    // Check if fee is required and not yet approved
    if (totalProfit > 0 && !hasFeeApproved) {
      setShowFeeDialog(true);
      return;
    }

    withdrawMutation.mutate();
  };

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(withdrawAmount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (!selectedWithdrawMethod) throw new Error("Select a withdrawal method");
      if (!withdrawWallet.trim()) throw new Error("Enter your wallet address");
      if (amt > walletBalance) throw new Error("Insufficient balance");
      const method = `${selectedWithdrawMethod.currency}${selectedWithdrawMethod.network ? ` (${selectedWithdrawMethod.network})` : ""}`;
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "withdrawal",
        method,
        amount: amt,
        currency: selectedWithdrawMethod.currency,
        status: "pending",
        wallet_address: withdrawWallet.trim(),
      });
      if (error) throw error;

      // Send withdrawal request email to user
      const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("user_id", user!.id).single();
      if (prof?.email) {
        supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'withdrawal-request',
            recipientEmail: prof.email,
            idempotencyKey: `withdrawal-req-${user!.id}-${Date.now()}`,
            templateData: { name: prof.full_name || undefined, amount: amt.toLocaleString(), method },
          },
        });
      }

      // Notify admin(s) about the new withdrawal
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (adminRoles && adminRoles.length > 0) {
        const { data: adminProfiles } = await supabase.from("profiles").select("email").in("user_id", adminRoles.map(r => r.user_id));
        for (const admin of adminProfiles ?? []) {
          if (admin.email) {
            supabase.functions.invoke('send-transactional-email', {
              body: {
                templateName: 'admin-new-withdrawal',
                recipientEmail: admin.email,
                idempotencyKey: `admin-withdrawal-${user!.id}-${Date.now()}-${admin.email}`,
                templateData: {
                  userName: prof?.full_name || 'Unknown',
                  userEmail: prof?.email || user!.email || '',
                  amount: amt.toLocaleString('en-US', { minimumFractionDigits: 2 }),
                  method,
                  currency: selectedWithdrawMethod!.currency,
                  walletAddress: withdrawWallet.trim(),
                  submittedAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast.success("Withdrawal request submitted for review.");
      setWithdrawAmount("");
      setWithdrawMethodId("");
      setWithdrawWallet("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { format } = useCurrency();
  const fmt = (n: number) => format(n);

  const pendingCount = (transactions ?? []).filter(t => t.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Deposit & Withdraw</h1>
        <p className="text-muted-foreground text-sm">Manage your funds securely</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
              <p className="text-xl font-display font-bold text-foreground">{fmt(walletBalance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deposited</p>
              <p className="text-xl font-display font-bold text-success">{fmt(totalDeposited)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Withdrawn</p>
              <p className="text-xl font-display font-bold text-foreground">{fmt(totalWithdrawn)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-display font-bold text-foreground">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Profits */}
      {(profitLogs ?? []).length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Daily Profits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {(profitLogs ?? []).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">Investment profit</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-success">+{fmt(Number(log.amount))}</span>
                    <p className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <Tabs defaultValue="deposit">
              <TabsList className="w-full">
                <TabsTrigger value="deposit" className="flex-1">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw" className="flex-1">Withdraw</TabsTrigger>
              </TabsList>

              {/* DEPOSIT TAB */}
              <TabsContent value="deposit" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <Select value={depositMethodId} onValueChange={setDepositMethodId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select crypto" /></SelectTrigger>
                    <SelectContent>
                      {(depositMethods ?? []).length === 0 ? (
                        <SelectItem value="none" disabled>No methods available</SelectItem>
                      ) : (
                        (depositMethods ?? []).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.currency}{m.network ? ` (${m.network})` : ""}{m.label ? ` — ${m.label}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDepositMethod && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Send {selectedDepositMethod.currency} to this address:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-foreground bg-background p-2 rounded border border-border break-all">
                        {selectedDepositMethod.wallet_address}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedDepositMethod.wallet_address);
                          toast.success("Wallet address copied!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedDepositMethod.network && (
                      <p className="text-[10px] text-warning">⚠️ Make sure to use the {selectedDepositMethod.network} network</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground">Amount (USD)</label>
                  <Input placeholder="Enter amount" className="mt-1" type="number" min="1" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {["100", "500", "1000", "5000"].map((amt) => (
                    <Button key={amt} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setDepositAmount(amt)}>${Number(amt).toLocaleString()}</Button>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">All transactions are secured with 256-bit SSL encryption.</p>
                </div>
                <Button
                  className="w-full bg-gradient-brand text-primary-foreground font-semibold"
                  onClick={() => depositMutation.mutate()}
                  disabled={depositMutation.isPending || !depositMethodId || !depositAmount}
                >
                  {depositMutation.isPending ? "Processing..." : "Submit Deposit"}
                </Button>
              </TabsContent>

              {/* WITHDRAW TAB */}
              <TabsContent value="withdraw" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Withdrawal Method</label>
                  <Select value={withdrawMethodId} onValueChange={setWithdrawMethodId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      {(depositMethods ?? []).length === 0 ? (
                        <SelectItem value="none" disabled>No methods available</SelectItem>
                      ) : (
                        (depositMethods ?? []).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.currency}{m.network ? ` (${m.network})` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWithdrawMethod?.network && (
                  <p className="text-xs text-warning">⚠️ Withdrawal will be sent via {selectedWithdrawMethod.network} network</p>
                )}

                <div>
                  <label className="text-sm text-muted-foreground">Amount (USD)</label>
                  <Input placeholder="Enter amount" className="mt-1" type="number" min="1" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">Available: {fmt(walletBalance)}</p>
                </div>
                <div className="flex gap-2">
                  {["100", "500", "1000"].map((amt) => (
                    <Button key={amt} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setWithdrawAmount(amt)}>${Number(amt).toLocaleString()}</Button>
                  ))}
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setWithdrawAmount(String(walletBalance))}>Max</Button>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Your Wallet Address</label>
                  <Input placeholder="Enter your wallet address" className="mt-1 font-mono text-xs" value={withdrawWallet} onChange={(e) => setWithdrawWallet(e.target.value)} />
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleWithdrawClick}
                  disabled={withdrawMutation.isPending || !withdrawMethodId || !withdrawAmount || !withdrawWallet.trim()}
                >
                  {withdrawMutation.isPending ? "Processing..." : "Request Withdrawal"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {(transactions ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
            ) : (
              <div className="space-y-0">
                {(transactions ?? []).slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-success/10" : "bg-warning/10"}`}>
                        {tx.type === "deposit" ? <ArrowDownLeft className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-warning" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">{tx.method} · {tx.currency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${tx.type === "deposit" ? "text-success" : "text-foreground"}`}>
                        {tx.type === "deposit" ? "+" : "-"}{fmt(Number(tx.amount))}
                      </p>
                      <Badge variant="outline" className={`text-[10px] ${tx.status === "completed" ? "text-success border-success/30" : tx.status === "pending" ? "text-warning border-warning/30" : tx.status === "rejected" ? "text-destructive border-destructive/30" : "text-muted-foreground"}`}>
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

      <WithdrawalFeeDialog
        open={showFeeDialog}
        onClose={() => setShowFeeDialog(false)}
        onProceed={() => {
          setShowFeeDialog(false);
          navigate("/dashboard/fee-payment");
        }}
        userName={profile?.full_name ?? "User"}
        totalProfit={totalProfit}
        processingFee={processingFee}
      />
    </div>
  );
};

export default DashboardWallet;
