import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Wifi, WifiOff } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMarketPrices, type MarketAsset } from "@/hooks/useMarketPrices";

const DashboardTrading = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const marketAssets = useMarketPrices(5000);
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");

  // Build a rolling chart from price snapshots
  const chartHistoryRef = useRef<{ t: string; p: number }[]>([]);
  const selectedAsset = marketAssets.find((a) => a.displayName === selectedPair);

  useEffect(() => {
    if (!selectedAsset) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    chartHistoryRef.current = [
      ...chartHistoryRef.current.slice(-29),
      { t: now, p: selectedAsset.price },
    ];
  }, [selectedAsset?.price, selectedPair]);

  // Reset chart when pair changes
  useEffect(() => {
    chartHistoryRef.current = [];
  }, [selectedPair]);

  const chartData = chartHistoryRef.current;

  const { data: openTrades } = useQuery({
    queryKey: ["trades-open", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("user_id", user!.id).eq("status", "open").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const placeTrade = useMutation({
    mutationFn: async (side: "buy" | "sell") => {
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      const { error } = await supabase.from("trades").insert({
        user_id: user!.id,
        asset: selectedPair,
        side,
        amount: amt,
        price: price ? parseFloat(price) : null,
        take_profit: tp ? parseFloat(tp) : null,
        stop_loss: sl ? parseFloat(sl) : null,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: (_, side) => {
      queryClient.invalidateQueries({ queryKey: ["trades-open", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["trades", user?.id] });
      toast.success(`${side.charAt(0).toUpperCase() + side.slice(1)} order placed for ${selectedPair}`);
      setAmount("");
      setPrice("");
      setTp("");
      setSl("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const closeTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      const { error } = await supabase.from("trades").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", tradeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades-open", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["trades", user?.id] });
      toast.success("Trade closed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Trading</h1>
        <p className="text-muted-foreground text-sm">Execute trades and manage your positions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
              {marketAssets.length > 0 ? (
                <span className="flex items-center gap-1 text-xs text-success"><Wifi className="h-3 w-3" /> Live</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><WifiOff className="h-3 w-3" /> Connecting</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {marketAssets.map((asset) => {
                const up = asset.change24h >= 0;
                const flash = asset.price > asset.prevPrice ? "bg-success/10" : asset.price < asset.prevPrice ? "bg-destructive/10" : "";
                return (
                  <button
                    key={asset.displayName}
                    onClick={() => setSelectedPair(asset.displayName)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-all border-b border-border/50 last:border-0 ${selectedPair === asset.displayName ? "bg-muted" : ""} ${flash}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{asset.displayName}</span>
                      {asset.source === "binance" && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-success/30 text-success">LIVE</Badge>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground font-mono">{asset.price < 10 ? asset.price.toFixed(4) : asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      <p className={`text-xs flex items-center gap-0.5 justify-end ${up ? "text-success" : "text-destructive"}`}>
                        {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {up ? "+" : ""}{asset.change24h.toFixed(2)}%
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{selectedPair} Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" stroke="hsl(215, 15%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
                  <Area type="monotone" dataKey="p" stroke="hsl(145, 60%, 45%)" fill="url(#chartGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <Tabs defaultValue="buy">
                <TabsList className="w-full">
                  <TabsTrigger value="buy" className="flex-1 data-[state=active]:bg-success/20 data-[state=active]:text-success">Buy</TabsTrigger>
                  <TabsTrigger value="sell" className="flex-1 data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">Sell</TabsTrigger>
                </TabsList>
                {(["buy", "sell"] as const).map((side) => (
                  <TabsContent key={side} value={side} className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Amount (USD)</label>
                        <Input placeholder="0.00" className="mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Price</label>
                        <Input placeholder="Market" className="mt-1" value={price} onChange={(e) => setPrice(e.target.value)} type="number" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Take Profit</label>
                        <Input placeholder="Optional" className="mt-1" value={tp} onChange={(e) => setTp(e.target.value)} type="number" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Stop Loss</label>
                        <Input placeholder="Optional" className="mt-1" value={sl} onChange={(e) => setSl(e.target.value)} type="number" />
                      </div>
                    </div>
                    <Button
                      className={`w-full font-semibold ${side === "buy" ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}
                      onClick={() => placeTrade.mutate(side)}
                      disabled={placeTrade.isPending}
                    >
                      {placeTrade.isPending ? "Placing..." : `Place ${side.charAt(0).toUpperCase() + side.slice(1)} Order`}
                    </Button>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(openTrades ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No open positions.</p>
            ) : (
              (openTrades ?? []).map((t) => (
                <div key={t.id} className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{t.asset}</span>
                    <Badge variant="outline" className={`text-xs ${t.side === "buy" ? "border-success text-success" : "border-destructive text-destructive"}`}>
                      {t.side.charAt(0).toUpperCase() + t.side.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>Amount: <span className="text-foreground">${Number(t.amount).toLocaleString()}</span></span>
                    {t.price && <span>Price: <span className="text-foreground">{t.price}</span></span>}
                    {t.take_profit && <span>TP: <span className="text-success">{t.take_profit}</span></span>}
                    {t.stop_loss && <span>SL: <span className="text-destructive">{t.stop_loss}</span></span>}
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => closeTrade.mutate(t.id)} disabled={closeTrade.isPending}>
                    Close Position
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTrading;
