import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, XCircle, ArrowDownLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DepositTx {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  currency: string;
  status: string;
  created_at: string;
  wallet_address: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  profile?: { full_name: string | null; email: string | null; wallet_balance: number } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const AdminDeposits = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositTx[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDeposits = async () => {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", "deposit")
      .order("created_at", { ascending: false });

    if (!txData) { setLoading(false); return; }

    const userIds = [...new Set(txData.map((t) => t.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, wallet_balance")
      .in("user_id", userIds);

    const profileMap = new Map((profilesData ?? []).map((p) => [p.user_id, p]));
    setDeposits(txData.map((t) => ({ ...t, profile: profileMap.get(t.user_id) ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handleApprove = async (tx: DepositTx) => {
    setActionLoading(tx.id);
    try {
      const { error: txError } = await supabase
        .from("transactions")
        .update({ status: "approved", reviewed_by: user?.id ?? null, updated_at: new Date().toISOString() })
        .eq("id", tx.id);
      if (txError) throw txError;

      const newBalance = (tx.profile?.wallet_balance ?? 0) + tx.amount;
      const { error: balError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("user_id", tx.user_id);
      if (balError) throw balError;

      // Send deposit approved email to user
      if (tx.profile?.email) {
        supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'deposit-approved',
            recipientEmail: tx.profile.email,
            idempotencyKey: `deposit-approved-${tx.id}`,
            templateData: { name: tx.profile.full_name || undefined, amount: tx.amount.toLocaleString(), method: tx.method },
          },
        });
      }

      toast.success(`Deposit approved — $${tx.amount.toLocaleString()} credited`);
      fetchDeposits();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    const tx = deposits.find(d => d.id === id);
    const { error } = await supabase
      .from("transactions")
      .update({ status: "rejected", reviewed_by: user?.id ?? null, updated_at: new Date().toISOString() })
      .eq("id", id);
    setActionLoading(null);
    if (error) { toast.error("Failed to reject"); return; }

    // Send deposit rejected email to user
    if (tx?.profile?.email) {
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'deposit-confirmation',
          recipientEmail: tx.profile.email,
          idempotencyKey: `deposit-rejected-${id}`,
          templateData: { name: tx.profile.full_name || undefined, amount: tx.amount.toLocaleString(), method: tx.method, status: 'rejected' },
        },
      });
    }

    toast.success("Deposit rejected");
    fetchDeposits();
  };

  const filtered = deposits.filter((t) => {
    const matchesStatus = filter === "all" || t.status === filter;
    const name = t.profile?.full_name ?? "";
    const email = t.profile?.email ?? "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Deposit Management</h1>
        <p className="text-muted-foreground text-sm">Approve or reject user deposits — balances update automatically</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-display font-bold text-warning">{deposits.filter(d => d.status === "pending").length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Approved</p><p className="text-2xl font-display font-bold text-success">{deposits.filter(d => d.status === "approved").length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Volume</p><p className="text-2xl font-display font-bold text-foreground">${deposits.filter(d => d.status === "approved").reduce((s, d) => s + d.amount, 0).toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
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
                  <th className="text-left p-4 text-muted-foreground font-medium">Method</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No deposits found</td></tr>
                ) : filtered.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-foreground">{tx.profile?.full_name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{tx.profile?.email ?? tx.user_id.slice(0, 8)}</p>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{tx.method} · {tx.currency}</td>
                    <td className="p-4 font-medium text-foreground">${tx.amount.toLocaleString()}</td>
                    <td className="p-4"><Badge className={`text-xs ${statusColors[tx.status] ?? ""}`}>{tx.status}</Badge></td>
                    <td className="p-4 text-muted-foreground text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      {tx.status === "pending" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success" disabled={actionLoading === tx.id} onClick={() => handleApprove(tx)}>
                            {actionLoading === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={actionLoading === tx.id} onClick={() => handleReject(tx.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDeposits;
