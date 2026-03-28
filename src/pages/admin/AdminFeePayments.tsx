import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FeePayment {
  id: string;
  user_id: string;
  total_profit: number;
  processing_fee: number;
  payment_method: string;
  proof_url: string | null;
  status: string;
  created_at: string;
  profile?: { full_name: string | null; email: string | null } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const fmt = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AdminFeePayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("fee_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const userIds = [...new Set(data.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    setPayments(data.map((p: any) => ({ ...p, profile: profileMap.get(p.user_id) ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setActionLoading(id);
    const { error } = await supabase
      .from("fee_payments")
      .update({ status: action, reviewed_by: user?.id ?? null })
      .eq("id", id);
    setActionLoading(null);
    if (error) { toast.error("Action failed"); return; }

    // Find payment to create notification and send email
    const payment = payments.find((p) => p.id === id);
    if (payment) {
      const title = action === "approved"
        ? "Payment Verified"
        : "Payment Rejected";
      const message = action === "approved"
        ? "Your processing fee payment has been verified. You can now withdraw your funds."
        : "Your processing fee payment could not be verified. Please resubmit valid proof.";

      // Create in-app notification
      const { data: notif } = await supabase.from("notifications").insert({
        title,
        message,
        target: "individual",
        target_user_id: payment.user_id,
        sent_by: user?.id,
        channel_in_app: true,
      }).select("id").single();

      if (notif) {
        await supabase.from("user_notifications").insert({
          user_id: payment.user_id,
          notification_id: notif.id,
        });
      }

      // Send email notification
      if (payment.profile?.email) {
        supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: action === "approved" ? 'fee-approved' : 'fee-rejected',
            recipientEmail: payment.profile.email,
            idempotencyKey: `fee-${action}-${id}`,
            templateData: { name: payment.profile.full_name || undefined },
          },
        });
      }
    }

    toast.success(`Payment ${action}`);
    fetchPayments();
  };

  const filtered = payments.filter((p) => {
    const matchesStatus = filter === "all" || p.status === filter;
    const name = p.profile?.full_name ?? "";
    const email = p.profile?.email ?? "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Fee Payments</h1>
        <p className="text-muted-foreground text-sm">Manage withdrawal processing fee payments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-display font-bold text-warning">{payments.filter(p => p.status === "pending").length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Approved</p><p className="text-2xl font-display font-bold text-success">{payments.filter(p => p.status === "approved").length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Collected</p><p className="text-2xl font-display font-bold text-foreground">{fmt(payments.filter(p => p.status === "approved").reduce((s, p) => s + Number(p.processing_fee), 0))}</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <th className="text-left p-4 text-muted-foreground font-medium">Total Profit</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Fee (10%)</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Method</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Proof</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No fee payments found</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-foreground">{p.profile?.full_name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{p.profile?.email ?? p.user_id.slice(0, 8)}</p>
                    </td>
                    <td className="p-4 font-medium text-foreground">{fmt(Number(p.total_profit))}</td>
                    <td className="p-4 font-bold text-primary">{fmt(Number(p.processing_fee))}</td>
                    <td className="p-4 text-muted-foreground text-xs">{p.payment_method}</td>
                    <td className="p-4">
                      {p.proof_url ? (
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setProofUrl(p.proof_url)}>
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="p-4"><Badge className={`text-xs ${statusColors[p.status] ?? ""}`}>{p.status}</Badge></td>
                    <td className="p-4 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      {p.status === "pending" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success" disabled={actionLoading === p.id} onClick={() => handleAction(p.id, "approved")}>
                            {actionLoading === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={actionLoading === p.id} onClick={() => handleAction(p.id, "rejected")}>
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

      {/* Proof viewer */}
      <Dialog open={!!proofUrl} onOpenChange={() => setProofUrl(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {proofUrl && (
            <div className="max-h-[70vh] overflow-auto">
              <img src={proofUrl} alt="Payment proof" className="w-full rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeePayments;
