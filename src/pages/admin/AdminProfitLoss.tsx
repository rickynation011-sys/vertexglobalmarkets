import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DollarSign, TrendingUp, TrendingDown, Search, ArrowUpDown, AlertTriangle } from "lucide-react";

const AdminProfitLoss = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [actionType, setActionType] = useState<"credit" | "debit">("credit");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ["admin-all-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, email, full_name, wallet_balance").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Fetch recent admin profit/debit transactions
  const { data: recentAdjustments } = useQuery({
    queryKey: ["admin-profit-adjustments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .in("type", ["admin_credit", "admin_debit"])
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const filteredProfiles = (profiles ?? []).filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (p.email?.toLowerCase().includes(term) || p.full_name?.toLowerCase().includes(term));
  });

  const selectedProfile = (profiles ?? []).find(p => p.user_id === selectedUserId);

  const handleSubmit = async () => {
    if (!selectedUserId || !amount || Number(amount) <= 0) {
      toast.error("Please select a user and enter a valid amount");
      return;
    }
    if (!note.trim()) {
      toast.error("A reason is required for all profit adjustments");
      return;
    }

    const amt = Number(amount);
    if (!selectedProfile) return;

    const currentBalance = Number(selectedProfile.wallet_balance);

    // Prevent debiting more than available
    if (actionType === "debit" && amt > currentBalance) {
      toast.error(`Cannot debit $${amt.toFixed(2)} — user only has $${currentBalance.toFixed(2)}`);
      return;
    }

    // Show confirmation dialog
    setConfirmDialog(true);
  };

  const executeAdjustment = async () => {
    setConfirmDialog(false);
    if (!selectedProfile) return;

    const amt = Number(amount);
    const currentBalance = Number(selectedProfile.wallet_balance);
    const newBalance = actionType === "credit"
      ? currentBalance + amt
      : currentBalance - amt;

    setSubmitting(true);
    try {
      // 1. Update wallet balance
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("user_id", selectedUserId);

      if (profileErr) throw profileErr;

      // 2. Record transaction for audit trail
      const { error: txnErr } = await supabase.from("transactions").insert({
        user_id: selectedUserId,
        type: actionType === "credit" ? "admin_credit" : "admin_debit",
        amount: amt,
        method: "admin",
        status: "completed",
        currency: "USD",
        admin_notes: note.trim(),
        reviewed_by: user?.id,
      });

      if (txnErr) throw txnErr;

      // 3. For credits, also insert into profit_logs if user has any investment
      if (actionType === "credit") {
        const { data: inv } = await supabase
          .from("investments")
          .select("id")
          .eq("user_id", selectedUserId)
          .limit(1)
          .maybeSingle();

        if (inv) {
          await supabase.from("profit_logs").insert({
            user_id: selectedUserId,
            investment_id: inv.id,
            amount: amt,
          });
        }
      }

      // 4. Send notification
      const { data: notif } = await supabase.from("notifications").insert({
        title: actionType === "credit" ? "Profit Credited" : "Account Adjustment",
        message: actionType === "credit"
          ? `$${amt.toFixed(2)} profit has been credited to your wallet. Reason: ${note.trim()}`
          : `$${amt.toFixed(2)} has been debited from your wallet. Reason: ${note.trim()}`,
        target: "specific",
        target_user_id: selectedUserId,
        sent_by: user?.id,
      }).select("id").single();

      if (notif) {
        await supabase.from("user_notifications").insert({
          user_id: selectedUserId,
          notification_id: notif.id,
        });
      }

      toast.success(`Successfully ${actionType === "credit" ? "credited" : "debited"} $${amt.toFixed(2)}`);
      setAmount("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-all-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-profit-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-manual-adjustments"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to process adjustment");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Profit & Loss Manager</h1>
        <p className="text-muted-foreground text-sm">Credit or debit user profits with full transaction audit trail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adjustment Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              New Profit Adjustment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Search User</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredProfiles.map(p => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      <span className="flex items-center gap-2">
                        <span>{p.full_name || "Unnamed"}</span>
                        <span className="text-muted-foreground text-xs">({p.email})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfile && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-lg font-bold text-foreground">{fmt(Number(selectedProfile.wallet_balance))}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Action Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={actionType === "credit" ? "default" : "outline"}
                  onClick={() => setActionType("credit")}
                  className="w-full"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Credit (Profit)
                </Button>
                <Button
                  variant={actionType === "debit" ? "destructive" : "outline"}
                  onClick={() => setActionType("debit")}
                  className="w-full"
                >
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Debit (Loss)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Required — describe the reason for this adjustment..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
              />
            </div>

            {selectedProfile && amount && Number(amount) > 0 && (
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Preview</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Balance:</span>
                  <span className="font-bold text-foreground">
                    {fmt(actionType === "credit"
                      ? Number(selectedProfile.wallet_balance) + Number(amount)
                      : Math.max(0, Number(selectedProfile.wallet_balance) - Number(amount))
                    )}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedUserId || !amount || Number(amount) <= 0 || !note.trim()}
              className="w-full"
            >
              {submitting ? "Processing..." : `Apply ${actionType === "credit" ? "Credit" : "Debit"}`}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Adjustments from transactions table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Profit Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {(recentAdjustments ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No adjustments yet</p>
              ) : (
                (recentAdjustments ?? []).map(adj => {
                  const profile = (profiles ?? []).find(p => p.user_id === adj.user_id);
                  const isCredit = adj.type === "admin_credit";
                  return (
                    <div key={adj.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{profile?.full_name || profile?.email || "Unknown"}</p>
                        <Badge variant={isCredit ? "default" : "destructive"} className="font-mono text-xs">
                          {isCredit ? "+" : "-"}{fmt(Number(adj.amount))}
                        </Badge>
                      </div>
                      {adj.admin_notes && (
                        <p className="text-xs text-muted-foreground">Reason: {adj.admin_notes}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">{new Date(adj.created_at).toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm {actionType === "credit" ? "Profit Credit" : "Profit Debit"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              You are about to <strong>{actionType === "credit" ? "credit" : "debit"}</strong>{" "}
              <strong className={actionType === "credit" ? "text-success" : "text-destructive"}>
                {fmt(Number(amount || 0))}
              </strong>{" "}
              {actionType === "credit" ? "to" : "from"}{" "}
              <strong>{selectedProfile?.full_name || selectedProfile?.email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">Reason: <em>{note}</em></p>
            <p className="text-xs text-muted-foreground">This action will be recorded in the transaction history and cannot be undone automatically.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button
              onClick={executeAdjustment}
              disabled={submitting}
              className={actionType === "credit" ? "bg-success text-success-foreground hover:bg-success/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            >
              {submitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProfitLoss;
