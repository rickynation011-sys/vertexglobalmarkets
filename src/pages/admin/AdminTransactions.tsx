import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, XCircle, Eye, ArrowDownLeft, ArrowUpRight, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Transaction = Tables<"transactions"> & { profile?: { full_name: string | null; email: string | null } | null };

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

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, profiles!transactions_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      const { data: fallback } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      setTransactions((fallback ?? []) as Transaction[]);
    } else {
      setTransactions((data ?? []) as Transaction[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("transactions")
      .update({
        status,
        reviewed_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error(`Failed to ${status} transaction`);
    } else {
      toast.success(`Transaction ${status}`);
      fetchTransactions();
    }
  };

  const filtered = transactions.filter((t) => {
    const matchesStatus = filter === "all" || t.status === filter;
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const name = t.profiles?.full_name ?? "";
    const email = t.profiles?.email ?? "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search);
    return matchesStatus && matchesType && matchesSearch;
  });

  const pendingDeposits = transactions.filter((t) => t.type === "deposit" && t.status === "pending");
  const pendingWithdrawals = transactions.filter((t) => t.type === "withdrawal" && t.status === "pending");
  const todayVolume = transactions
    .filter((t) => {
      const today = new Date().toDateString();
      return new Date(t.created_at).toDateString() === today;
    })
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Transaction Management</h1>
          <p className="text-muted-foreground text-sm">Approve deposits and withdrawals</p>
        </div>
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
            <p className="text-2xl font-display font-bold text-info">{pendingWithdrawals.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Volume Today</p>
            <p className="text-2xl font-display font-bold text-foreground">${todayVolume.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">ID</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Method</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
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
                      <td className="p-4 font-mono text-xs text-muted-foreground">{tx.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{tx.profiles?.full_name ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{tx.profiles?.email ?? tx.user_id.slice(0, 8)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {tx.type === "deposit" ? <ArrowDownLeft className="h-3 w-3 text-success" /> : <ArrowUpRight className="h-3 w-3 text-warning" />}
                          <span className="capitalize text-foreground">{tx.type}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{tx.method}</td>
                      <td className="p-4 font-medium text-foreground">${tx.amount.toLocaleString()}</td>
                      <td className="p-4"><Badge className={`text-xs ${statusColors[tx.status] ?? ""}`}>{tx.status}</Badge></td>
                      <td className="p-4 text-muted-foreground text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {tx.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleAction(tx.id, "approved")}><CheckCircle className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleAction(tx.id, "rejected")}><XCircle className="h-4 w-4" /></Button>
                            </>
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
    </div>
  );
};

export default AdminTransactions;
