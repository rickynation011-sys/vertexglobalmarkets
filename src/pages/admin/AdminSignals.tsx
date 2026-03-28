import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, XCircle, Signal, Loader2, Users, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SignalSub {
  id: string;
  user_id: string;
  plan_name: string;
  amount: number;
  status: string;
  started_at: string;
  expires_at: string;
  transaction_id: string | null;
  created_at: string;
  profile?: { full_name: string | null; email: string | null } | null;
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  expired: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

const AdminSignals = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<SignalSub[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubs = async () => {
    const { data } = await supabase
      .from("signal_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const userIds = [...new Set(data.map(s => s.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    const profileMap = new Map((profilesData ?? []).map(p => [p.user_id, p]));
    setSubs(data.map(s => ({ ...s, profile: profileMap.get(s.user_id) ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleApprove = async (sub: SignalSub) => {
    setActionLoading(sub.id);
    try {
      // Activate the subscription
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from("signal_subscriptions")
        .update({ status: "active", started_at: new Date().toISOString(), expires_at: expiresAt.toISOString() })
        .eq("id", sub.id);
      if (error) throw error;

      // Also approve the linked transaction if exists
      if (sub.transaction_id) {
        await supabase
          .from("transactions")
          .update({ status: "approved", reviewed_by: user?.id ?? null, updated_at: new Date().toISOString() })
          .eq("id", sub.transaction_id);
      }

      toast.success(`Signal subscription activated for ${sub.profile?.full_name ?? "user"}`);
      fetchSubs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (sub: SignalSub) => {
    setActionLoading(sub.id);
    try {
      const { error } = await supabase
        .from("signal_subscriptions")
        .update({ status: "rejected" as any })
        .eq("id", sub.id);
      if (error) throw error;

      if (sub.transaction_id) {
        await supabase
          .from("transactions")
          .update({ status: "rejected", reviewed_by: user?.id ?? null, updated_at: new Date().toISOString() })
          .eq("id", sub.transaction_id);
      }

      toast.success("Signal subscription rejected");
      fetchSubs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const activeSubs = subs.filter(s => s.status === "active" && new Date(s.expires_at) > new Date());
  const pendingSubs = subs.filter(s => s.status === "pending");
  const totalRevenue = subs.filter(s => s.status === "active").reduce((sum, s) => sum + Number(s.amount), 0);

  const filtered = subs.filter(s => {
    const matchesStatus = filter === "all" || s.status === filter || (filter === "expired" && s.status === "active" && new Date(s.expires_at) <= new Date());
    const name = s.profile?.full_name ?? "";
    const email = s.profile?.email ?? "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase()) || s.plan_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Signal Subscriptions</h1>
        <p className="text-muted-foreground text-sm">Manage trading signal subscriptions — approve pending purchases</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10"><Signal className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Active Signals</p>
                <p className="text-xl font-display font-bold text-success">{activeSubs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10"><Users className="h-5 w-5 text-warning" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-display font-bold text-warning">{pendingSubs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Subscribers</p>
                <p className="text-xl font-display font-bold text-foreground">{new Set(subs.map(s => s.user_id)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10"><DollarSign className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-display font-bold text-success">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by user or plan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
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
                  <th className="text-left p-4 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Expires</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No signal subscriptions found</td></tr>
                ) : filtered.map((sub) => {
                  const isExpired = sub.status === "active" && new Date(sub.expires_at) <= new Date();
                  const displayStatus = isExpired ? "expired" : sub.status;
                  return (
                    <tr key={sub.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{sub.profile?.full_name ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{sub.profile?.email ?? sub.user_id.slice(0, 8)}</p>
                      </td>
                      <td className="p-4 text-foreground">{sub.plan_name}</td>
                      <td className="p-4 font-medium text-foreground">${Number(sub.amount).toLocaleString()}</td>
                      <td className="p-4"><Badge className={`text-xs ${statusColors[displayStatus] ?? ""}`}>{displayStatus}</Badge></td>
                      <td className="p-4 text-muted-foreground text-xs">{new Date(sub.expires_at).toLocaleDateString()}</td>
                      <td className="p-4 text-muted-foreground text-xs">{new Date(sub.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {sub.status === "pending" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success" disabled={actionLoading === sub.id} onClick={() => handleApprove(sub)}>
                              {actionLoading === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={actionLoading === sub.id} onClick={() => handleReject(sub)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSignals;
