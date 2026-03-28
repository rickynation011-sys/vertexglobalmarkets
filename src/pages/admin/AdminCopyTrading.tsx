import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Copy, TrendingUp, Users, DollarSign, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminCopyTrading = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTrades = async () => {
      const { data: tradesData } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: false });

      if (!tradesData) { setLoading(false); return; }

      const userIds = [...new Set(tradesData.map((t: any) => t.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const profileMap = new Map((profilesData ?? []).map((p: any) => [p.user_id, p]));
      setTrades(tradesData.map((t: any) => ({ ...t, profile: profileMap.get(t.user_id) ?? null })));
      setLoading(false);
    };
    fetchTrades();
  }, []);

  const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0);
  const openTrades = trades.filter(t => t.status === "open").length;
  const totalVolume = trades.reduce((sum, t) => sum + Number(t.amount), 0);
  const uniqueTraders = new Set(trades.map(t => t.user_id)).size;

  const statusColors: Record<string, string> = {
    open: "bg-success/10 text-success",
    closed: "bg-muted text-muted-foreground",
  };

  const filtered = trades.filter((t) => {
    const name = t.profile?.full_name ?? "";
    const email = t.profile?.email ?? "";
    return name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase()) || t.asset.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Copy Trading Management</h1>
        <p className="text-muted-foreground text-sm">Monitor and manage all copy trading activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Active Traders</p>
                <p className="text-xl font-display font-bold text-foreground">{uniqueTraders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10"><TrendingUp className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Open Trades</p>
                <p className="text-xl font-display font-bold text-success">{openTrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Volume</p>
                <p className="text-xl font-display font-bold text-foreground">${totalVolume.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10"><TrendingUp className="h-5 w-5 text-warning" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total P&L</p>
                <p className={`text-xl font-display font-bold ${totalPnl >= 0 ? "text-success" : "text-destructive"}`}>${totalPnl.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by user or asset..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Asset</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Side</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">P&L</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No trades found</td></tr>
                ) : filtered.slice(0, 50).map((t) => (
                  <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-foreground">{t.profile?.full_name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{t.profile?.email ?? t.user_id.slice(0, 8)}</p>
                    </td>
                    <td className="p-4 font-medium text-foreground">{t.asset}</td>
                    <td className="p-4">
                      <Badge className={`text-xs ${t.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{t.side}</Badge>
                    </td>
                    <td className="p-4 text-foreground">${Number(t.amount).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={Number(t.pnl ?? 0) >= 0 ? "text-success" : "text-destructive"}>
                        {Number(t.pnl ?? 0) >= 0 ? "+" : ""}${Number(t.pnl ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4"><Badge className={`text-xs ${statusColors[t.status] ?? ""}`}>{t.status}</Badge></td>
                    <td className="p-4 text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString()}</td>
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

export default AdminCopyTrading;
