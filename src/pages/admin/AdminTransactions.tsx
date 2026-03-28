import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Transaction = Tables<"transactions"> & { profile?: { full_name: string | null; email: string | null; wallet_balance: number } | null };

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-primary/10 text-primary",
};

const AdminTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; txId: string }>({ open: false, txId: "" });
  const [rejectNotes, setRejectNotes] = useState("");

  const fetchTransactions = async () => {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!txData) { setLoading(false); return; }

    const userIds = [...new Set(txData.map((t) => t.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, wallet_balance")
      .in("user_id", userIds);

    const profileMap = new Map((profilesData ?? []).map((p) => [p.user_id, p]));

    const enriched: Transaction[] = txData.map((t) => ({
      ...t,
      profile: profileMap.get(t.user_id) ?? null,
    }));

    setTransactions(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleApprove = async (tx: Transaction) => {
    setActionLoading(tx.id);
    try {
      // Update transaction status
      const { error: txError } = await supabase
        .from("transactions")
        .update({
          status: "approved",
          reviewed_by: user?.id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tx.id);

      if (txError) throw txError;

      // Update user wallet balance
      const currentBalance = tx.profile?.wallet_balance ?? 0;
      let newBalance: number;

      if (tx.type === "deposit") {
        newBalance = currentBalance + tx.amount;
      } else {
        // withdrawal
        newBalance = Math.max(0, currentBalance - tx.amount);
      }

      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("user_id", tx.user_id);

      if (balanceError) throw balanceError;

      toast.success(
        tx.type === "deposit"
          ? `Deposit approved — $${tx.amount.toLocaleString()} credited to user`
          : `Withdrawal approved — $${tx.amount.toLocaleString()} debited from user`
      );
      fetchTransactions();
    } catch (err: any) {
      toast.error(`Failed to approve: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    const txId = rejectDialog.txId;
    setActionLoading(txId);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "rejected",
          reviewed_by: user?.id ?? null,
          admin_notes: rejectNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", txId);

      if (error) throw error;
      toast.success("Transaction rejected");
      setRejectDialog({ open: false, txId: "" });
      setRejectNotes("");
      fetchTransactions();
    } catch (err: any) {
      toast.error(`Failed to reject: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchesStatus = filter === "all" || t.status === filter;
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const name = t.profile?.full_name ?? "";
    const email = t.profile?.email ?? "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search);
    return matchesStatus && matchesType && matchesSearch;
  });

  const pendingDeposits = transactions.filter((t) => t.type === "deposit" && t.status === "pending");
  const pendingWithdrawals = transactions.filter((t) => t.type === "withdrawal" && t.status === "pending");
  const todayVolume = transactions
    .filter((t) => new Date(t.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Transaction Management</h1>
        <p className="text-muted-foreground text-sm">Approve deposits, withdrawals — balances update automatically</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Pending</p>
            <p className="text-2xl font-display font-bold text-warning">{transactions.filter((t) => t.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Deposits</p>
            <p className="text-2xl font-display font-bold text-success">{pendingDeposits.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
            <p className="text-2xl font-display font-bold text-primary">{pendingWithdrawals.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Volume Today</p>
            <p className="text-2xl font-display font-bold text-foreground">${todayVolume.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or ID..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Method</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Wallet</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No transactions found</td></tr>
                ) : (
                  filtered.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{tx.profile?.full_name ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{tx.profile?.email ?? tx.user_id.slice(0, 8)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {tx.type === "deposit" ? <ArrowDownLeft className="h-3 w-3 text-success" /> : <ArrowUpRight className="h-3 w-3 text-warning" />}
                          <span className="capitalize text-foreground">{tx.type}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">{tx.method}</td>
                      <td className="p-4 font-medium text-foreground">${tx.amount.toLocaleString()}</td>
                      <td className="p-4">
                        {tx.wallet_address ? (
                          <code className="text-[10px] font-mono text-muted-foreground">{tx.wallet_address.slice(0, 12)}...</code>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4"><Badge className={`text-xs ${statusColors[tx.status] ?? ""}`}>{tx.status}</Badge></td>
                      <td className="p-4 text-muted-foreground text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {tx.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-success"
                                disabled={actionLoading === tx.id}
                                onClick={() => handleApprove(tx)}
                                title="Approve & process"
                              >
                                {actionLoading === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                disabled={actionLoading === tx.id}
                                onClick={() => setRejectDialog({ open: true, txId: tx.id })}
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {tx.admin_notes && (
                            <span className="text-[10px] text-muted-foreground ml-1" title={tx.admin_notes}>📝</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => { if (!open) { setRejectDialog({ open: false, txId: "" }); setRejectNotes(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Reason (optional)</label>
            <Textarea placeholder="Add rejection notes..." value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, txId: "" })}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!!actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransactions;
