import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

const statusColor: Record<string, string> = {
  closed: "bg-muted text-muted-foreground",
  completed: "bg-success/10 text-success",
  active: "bg-primary/10 text-primary",
  open: "bg-primary/10 text-primary",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

const DashboardHistory = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: transactions } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: trades } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: investments } = useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("investments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  // Merge all into unified history
  const history = useMemo(() => {
    const items: Array<{ id: string; type: string; asset: string; side: string; amount: string; pnl: string; status: string; date: string }> = [];

    (transactions ?? []).forEach(t => {
      items.push({
        id: t.id.slice(0, 8).toUpperCase(),
        type: t.type === "deposit" ? "Deposit" : "Withdrawal",
        asset: "—",
        side: "—",
        amount: `$${Number(t.amount).toLocaleString()}`,
        pnl: "—",
        status: t.status,
        date: new Date(t.created_at).toLocaleString(),
      });
    });

    (trades ?? []).forEach(t => {
      items.push({
        id: t.id.slice(0, 8).toUpperCase(),
        type: "Trade",
        asset: t.asset,
        side: t.side.charAt(0).toUpperCase() + t.side.slice(1),
        amount: `$${Number(t.amount).toLocaleString()}`,
        pnl: Number(t.pnl) !== 0 ? `${Number(t.pnl) > 0 ? "+" : ""}$${Number(t.pnl).toLocaleString()}` : "—",
        status: t.status,
        date: new Date(t.created_at).toLocaleString(),
      });
    });

    (investments ?? []).forEach(i => {
      items.push({
        id: i.id.slice(0, 8).toUpperCase(),
        type: "Investment",
        asset: i.plan_name,
        side: "—",
        amount: `$${Number(i.amount).toLocaleString()}`,
        pnl: Number(i.return_pct) !== 0 ? `+${Number(i.return_pct).toFixed(1)}%` : "—",
        status: i.status,
        date: new Date(i.created_at).toLocaleString(),
      });
    });

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [transactions, trades, investments]);

  const filtered = history.filter(h => {
    if (typeFilter !== "all" && h.type.toLowerCase() !== typeFilter) return false;
    if (search && !h.asset.toLowerCase().includes(search.toLowerCase()) && !h.id.toLowerCase().includes(search.toLowerCase()) && !h.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const csv = ["ID,Type,Asset,Side,Amount,P&L,Status,Date", ...filtered.map(h => `${h.id},${h.type},${h.asset},${h.side},${h.amount},${h.pnl},${h.status},${h.date}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transaction-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground text-sm">View all your past transactions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="trade">Trades</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="investment">Investments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted-foreground font-medium">ID</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Asset</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Side</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">P&L</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => (
                    <tr key={`${tx.id}-${i}`} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-xs text-muted-foreground">{tx.id}</td>
                      <td className="p-4 text-foreground">{tx.type}</td>
                      <td className="p-4 text-foreground">{tx.asset}</td>
                      <td className={`p-4 ${tx.side === "Buy" ? "text-success" : tx.side === "Sell" ? "text-destructive" : "text-muted-foreground"}`}>{tx.side}</td>
                      <td className="p-4 text-foreground">{tx.amount}</td>
                      <td className={`p-4 ${tx.pnl.startsWith("+") ? "text-success" : tx.pnl.startsWith("-") ? "text-destructive" : "text-muted-foreground"}`}>{tx.pnl}</td>
                      <td className="p-4"><Badge className={`text-xs ${statusColor[tx.status] || ""}`}>{tx.status}</Badge></td>
                      <td className="p-4 text-right text-muted-foreground text-xs">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHistory;
