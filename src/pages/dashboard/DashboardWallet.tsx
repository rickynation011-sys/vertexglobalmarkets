import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownLeft, ArrowUpRight, Wallet, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

const DashboardWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");

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

  const completedDeposits = (transactions ?? []).filter(t => t.type === "deposit" && t.status === "completed");
  const completedWithdrawals = (transactions ?? []).filter(t => t.type === "withdrawal" && t.status === "completed");
  const totalDeposited = completedDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawn = completedWithdrawals.reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalDeposited - totalWithdrawn;

  const depositMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(depositAmount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (!depositMethod) throw new Error("Select a payment method");
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "deposit",
        method: depositMethod,
        amount: amt,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast.success("Deposit request submitted. It will be reviewed shortly.");
      setDepositAmount("");
      setDepositMethod("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(withdrawAmount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (!withdrawMethod) throw new Error("Select a withdrawal method");
      if (amt > balance) throw new Error("Insufficient balance");
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "withdrawal",
        method: withdrawMethod,
        amount: amt,
        status: "pending",
        wallet_address: withdrawWallet || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast.success("Withdrawal request submitted for review.");
      setWithdrawAmount("");
      setWithdrawMethod("");
      setWithdrawWallet("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Deposit & Withdraw</h1>
        <p className="text-muted-foreground text-sm">Manage your funds securely</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-xl font-display font-bold text-foreground">{fmt(balance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deposited</p>
              <p className="text-xl font-display font-bold text-foreground">{fmt(totalDeposited)}</p>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <Tabs defaultValue="deposit">
              <TabsList className="w-full">
                <TabsTrigger value="deposit" className="flex-1">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw" className="flex-1">Withdraw</TabsTrigger>
              </TabsList>
              <TabsContent value="deposit" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <Select value={depositMethod} onValueChange={setDepositMethod}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="usdt">USDT (TRC20)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Amount (USD)</label>
                  <Input placeholder="Enter amount" className="mt-1" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
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
                <Button className="w-full bg-gradient-brand text-primary-foreground font-semibold" onClick={() => depositMutation.mutate()} disabled={depositMutation.isPending}>
                  {depositMutation.isPending ? "Processing..." : "Deposit Funds"}
                </Button>
              </TabsContent>
              <TabsContent value="withdraw" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Withdrawal Method</label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="usdt">USDT (TRC20)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Amount (USD)</label>
                  <Input placeholder="Enter amount" className="mt-1" type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Wallet / Account</label>
                  <Input placeholder="Enter wallet address or account" className="mt-1" value={withdrawWallet} onChange={(e) => setWithdrawWallet(e.target.value)} />
                </div>
                <Button className="w-full" variant="outline" onClick={() => withdrawMutation.mutate()} disabled={withdrawMutation.isPending}>
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
                {(transactions ?? []).slice(0, 8).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-success/10" : "bg-warning/10"}`}>
                        {tx.type === "deposit" ? <ArrowDownLeft className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-warning" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">{tx.method.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${tx.type === "deposit" ? "text-success" : "text-foreground"}`}>
                        {tx.type === "deposit" ? "+" : "-"}{fmt(Number(tx.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className={`${tx.status === "completed" ? "text-success" : tx.status === "pending" ? "text-warning" : "text-muted-foreground"}`}>{tx.status}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardWallet;
