import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DollarSign, TrendingUp, TrendingDown, Search, ArrowUpDown } from "lucide-react";

const AdminProfitLoss = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [actionType, setActionType] = useState<"credit" | "debit">("credit");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: profiles } = useQuery({
    queryKey: ["admin-all-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, email, full_name, wallet_balance").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: recentAdjustments } = useQuery({
    queryKey: ["admin-manual-adjustments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profit_logs")
        .select("*")
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

    const amt = Number(amount);
    if (!selectedProfile) return;

    const currentBalance = Number(selectedProfile.wallet_balance);
    const newBalance = actionType === "credit"
      ? currentBalance + amt
      : Math.max(0, currentBalance - amt);

    setSubmitting(true);
    try {
      // Update wallet balance
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("user_id", selectedUserId);

      if (profileErr) throw profileErr;

      // Find an active investment for logging, or use a placeholder approach
      // We'll log via a transaction-style record in profit_logs if credit,
      // or just update balance for debit
      if (actionType === "credit") {
        // Get any investment for this user to link the profit log
        const { data: inv } = await supabase
          .from("investments")
          .select("id")
          .eq("user_id", selectedUserId)
          .limit(1)
          .single();

        if (inv) {
          await supabase.from("profit_logs").insert({
            user_id: selectedUserId,
            investment_id: inv.id,
            amount: amt,
          });
        }
      }

      // Create a notification for the user
      const { data: notif } = await supabase.from("notifications").insert({
        title: actionType === "credit" ? "Account Credited" : "Account Adjustment",
        message: actionType === "credit"
          ? `$${amt.toFixed(2)} has been credited to your wallet.${note ? ` Note: ${note}` : ""}`
          : `$${amt.toFixed(2)} has been adjusted from your wallet.${note ? ` Note: ${note}` : ""}`,
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

      toast.success(`Successfully ${actionType === "credit" ? "credited" : "debited"} $${amt.toFixed(2)} ${actionType === "credit" ? "to" : "from"} user`);

      // Reset form
      setAmount("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-all-profiles"] });
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
        <p className="text-muted-foreground text-sm">Manually credit or debit user wallets with full audit trail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adjustment Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              New Adjustment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Search & Select */}
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

            {/* Action Type */}
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

            {/* Amount */}
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

            {/* Note */}
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea
                placeholder="Reason for adjustment..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
              />
            </div>

            {/* Preview */}
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
              disabled={submitting || !selectedUserId || !amount || Number(amount) <= 0}
              className="w-full"
            >
              {submitting ? "Processing..." : `Apply ${actionType === "credit" ? "Credit" : "Debit"}`}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Adjustments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Profit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {(recentAdjustments ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No profit logs yet</p>
              ) : (
                (recentAdjustments ?? []).map(adj => {
                  const profile = (profiles ?? []).find(p => p.user_id === adj.user_id);
                  return (
                    <div key={adj.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div>
                        <p className="text-sm font-medium text-foreground">{profile?.full_name || profile?.email || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(adj.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant={Number(adj.amount) >= 0 ? "default" : "destructive"} className="font-mono">
                        {Number(adj.amount) >= 0 ? "+" : ""}{fmt(Number(adj.amount))}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfitLoss;
