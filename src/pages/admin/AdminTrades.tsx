import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, TrendingUp, TrendingDown, BarChart3, DollarSign, Users,
  ArrowUp, ArrowDown, XCircle, Edit, Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TradeWithProfile {
  id: string;
  user_id: string;
  asset: string;
  side: string;
  amount: number;
  price: number | null;
  pnl: number | null;
  status: string;
  stop_loss: number | null;
  take_profit: number | null;
  created_at: string;
  closed_at: string | null;
  profile?: { full_name: string | null; email: string | null } | null;
}

const statusColors: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
};

const AdminTrades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sideFilter, setSideFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit PnL dialog
  const [editTrade, setEditTrade] = useState<TradeWithProfile | null>(null);
  const [editPnl, setEditPnl] = useState("");

  const fetchTrades = async () => {
    setLoading(true);
    const { data: tradesData } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false });

    if (!tradesData) { setLoading(false); return; }

    const userIds = [...new Set(tradesData.map((t) => t.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    const profileMap = new Map((profilesData ?? []).map((p) => [p.user_id, p]));
    setTrades(tradesData.map((t) => ({ ...t, profile: profileMap.get(t.user_id) ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchTrades(); }, []);

  const handleCloseTrade = async (trade: TradeWithProfile) => {
    setActionLoading(trade.id);
    const { error } = await supabase
      .from("trades")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", trade.id);

    if (error) { toast.error("Failed to close trade"); }
    else { toast.success(`Trade ${trade.asset} closed`); fetchTrades(); }
    setActionLoading(null);
  };

  const handleSetPnl = async () => {
    if (!editTrade) return;
    const pnlValue = parseFloat(editPnl);
    if (isNaN(pnlValue)) { toast.error("Enter a valid number"); return; }

    setActionLoading(editTrade.id);
    const { error } = await supabase
      .from("trades")
      .update({ pnl: pnlValue })
      .eq("id", editTrade.id);

    if (error) { toast.error("Failed to update PnL"); }
    else { toast.success(`PnL updated to $${pnlValue.toFixed(2)}`); setEditTrade(null); setEditPnl(""); fetchTrades(); }
    setActionLoading(null);
  };

  const handleCloseWithPnl = async () => {
    if (!editTrade) return;
    const pnlValue = parseFloat(editPnl);
    if (isNaN(pnlValue)) { toast.error("Enter a valid number"); return; }

    setActionLoading(editTrade.id);
    const { error } = await supabase
      .from("trades")
      .update({ pnl: pnlValue, status: "closed", closed_at: new Date().toISOString() })
      .eq("id", editTrade.id);

    if (error) { toast.error("Failed to close trade"); }
    else { toast.success(`Trade closed with PnL $${pnlValue.toFixed(2)}`); setEditTrade(null); setEditPnl(""); fetchTrades(); }
    setActionLoading(null);
  };

  // Stats
  const totalPnl = trades.reduce((s, t) => s + Number(t.pnl ?? 0), 0);
  const openCount = trades.filter((t) => t.status === "open").length;
  const closedCount = trades.filter((t) => t.status === "closed").length;
  const totalVolume = trades.reduce((s, t) => s + Number(t.amount), 0);
  const uniqueTraders = new Set(trades.map((t) => t.user_id)).size;

  const filtered = trades.filter((t) => {
    const matchSearch =
      (t.profile?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.profile?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      t.asset.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchSide = sideFilter === "all" || t.side === sideFilter;
    return matchSearch && matchStatus && matchSide;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trade Management</h1>
        <p className="text-muted-foreground">View, close, and adjust PnL on all user trades.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center">
          <BarChart3 className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-2xl font-bold">{trades.length}</p>
          <p className="text-xs text-muted-foreground">Total Trades</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="mx-auto h-5 w-5 text-emerald-500 mb-1" />
          <p className="text-2xl font-bold">{openCount}</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <XCircle className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{closedCount}</p>
          <p className="text-xs text-muted-foreground">Closed</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <DollarSign className={`mx-auto h-5 w-5 mb-1 ${totalPnl >= 0 ? "text-emerald-500" : "text-destructive"}`} />
          <p className={`text-2xl font-bold ${totalPnl >= 0 ? "text-emerald-500" : "text-destructive"}`}>
            ${Math.abs(totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">Total PnL</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Users className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-2xl font-bold">{uniqueTraders}</p>
          <p className="text-xs text-muted-foreground">Traders</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search user or asset..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sideFilter} onValueChange={setSideFilter}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Side" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sides</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trade list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No trades found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{t.asset}</span>
                      <Badge variant="outline" className={t.side === "buy" ? "text-emerald-600 border-emerald-300" : "text-red-600 border-red-300"}>
                        {t.side === "buy" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {t.side.toUpperCase()}
                      </Badge>
                      <Badge className={statusColors[t.status] ?? "bg-muted text-muted-foreground"}>
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.profile?.full_name || t.profile?.email || "Unknown User"} • ${Number(t.amount).toLocaleString()} • {new Date(t.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      {t.price && <span>Entry: ${Number(t.price).toLocaleString()}</span>}
                      {t.stop_loss && <span>SL: ${Number(t.stop_loss).toLocaleString()}</span>}
                      {t.take_profit && <span>TP: ${Number(t.take_profit).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">PnL</p>
                      <p className={`font-bold ${(t.pnl ?? 0) >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                        {(t.pnl ?? 0) >= 0 ? "+" : ""}${Number(t.pnl ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditTrade(t); setEditPnl(String(t.pnl ?? 0)); }}
                    >
                      <Edit className="h-3 w-3 mr-1" /> PnL
                    </Button>
                    {t.status === "open" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === t.id}
                        onClick={() => handleCloseTrade(t)}
                      >
                        {actionLoading === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit PnL Dialog */}
      <Dialog open={!!editTrade} onOpenChange={(o) => { if (!o) { setEditTrade(null); setEditPnl(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trade PnL</DialogTitle>
            <DialogDescription>
              {editTrade?.asset} ({editTrade?.side.toUpperCase()}) — {editTrade?.profile?.full_name || editTrade?.profile?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>PnL Amount ($)</Label>
              <Input type="number" step="0.01" value={editPnl} onChange={(e) => setEditPnl(e.target.value)} placeholder="e.g. 150.00 or -50.00" />
              <p className="text-xs text-muted-foreground mt-1">Use negative values for losses</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSetPnl} disabled={!!actionLoading} className="flex-1">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Update PnL Only
              </Button>
              {editTrade?.status === "open" && (
                <Button variant="destructive" onClick={handleCloseWithPnl} disabled={!!actionLoading} className="flex-1">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Close with PnL
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTrades;
