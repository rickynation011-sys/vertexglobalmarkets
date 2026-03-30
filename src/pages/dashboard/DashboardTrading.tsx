import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Wifi, WifiOff, TrendingUp, TrendingDown, Users, BarChart3 } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import OrderBook from "@/components/dashboard/OrderBook";
import PriceAlerts from "@/components/dashboard/PriceAlerts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { useCurrency } from "@/contexts/CurrencyContext";

// ─── Candlestick Data Generation ───
type Candle = { time: string; open: number; high: number; low: number; close: number; volume: number };

const TIMEFRAMES = [
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 300 },
  { label: "15m", seconds: 900 },
  { label: "1H", seconds: 3600 },
  { label: "4H", seconds: 14400 },
  { label: "1D", seconds: 86400 },
] as const;

const MARKET_PAIRS = [
  { symbol: "BTC/USDT", displayName: "BTC/USDT", basePrice: 67500 },
  { symbol: "ETH/USDT", displayName: "ETH/USDT", basePrice: 3450 },
  { symbol: "SOL/USDT", displayName: "SOL/USDT", basePrice: 178 },
  { symbol: "BNB/USDT", displayName: "BNB/USDT", basePrice: 605 },
  { symbol: "XRP/USDT", displayName: "XRP/USDT", basePrice: 0.62 },
  { symbol: "ADA/USDT", displayName: "ADA/USDT", basePrice: 0.45 },
  { symbol: "DOGE/USDT", displayName: "DOGE/USDT", basePrice: 0.165 },
  { symbol: "AVAX/USDT", displayName: "AVAX/USDT", basePrice: 38.5 },
];

function generateCandles(basePrice: number, count: number, volatility: number = 0.02): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice * (0.95 + Math.random() * 0.1);
  const now = Date.now();

  for (let i = count; i > 0; i--) {
    const change = (Math.random() - 0.48) * volatility * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
    const volume = Math.floor(Math.random() * 1000000 + 50000);
    const time = new Date(now - i * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    candles.push({ time, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

// ─── Candlestick Chart (SVG) ───
function CandlestickChart({ candles, decimals }: { candles: Candle[]; decimals: number }) {
  const width = 800;
  const height = 340;
  const padding = { top: 20, right: 60, bottom: 30, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (candles.length === 0) return <div className="h-[340px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div>;

  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  const candleWidth = Math.max(2, (chartW / candles.length) * 0.7);
  const gap = chartW / candles.length;

  const yScale = (p: number) => padding.top + chartH - ((p - minPrice) / priceRange) * chartH;

  // Grid lines
  const gridLines = 5;
  const gridPrices = Array.from({ length: gridLines }, (_, i) => minPrice + (priceRange / (gridLines - 1)) * i);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[340px]" preserveAspectRatio="none">
      {/* Grid */}
      {gridPrices.map((p, i) => (
        <g key={i}>
          <line x1={padding.left} y1={yScale(p)} x2={width - padding.right} y2={yScale(p)} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4,4" opacity={0.5} />
          <text x={width - padding.right + 5} y={yScale(p) + 4} fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="monospace">
            {p.toFixed(decimals)}
          </text>
        </g>
      ))}

      {/* Volume bars */}
      {candles.map((c, i) => {
        const maxVol = Math.max(...candles.map(cc => cc.volume));
        const volH = (c.volume / maxVol) * chartH * 0.15;
        const x = padding.left + i * gap + (gap - candleWidth) / 2;
        const bullish = c.close >= c.open;
        return (
          <rect key={`vol-${i}`} x={x} y={padding.top + chartH - volH} width={candleWidth} height={volH} fill={bullish ? "hsl(var(--success))" : "hsl(var(--destructive))"} opacity={0.15} rx={1} />
        );
      })}

      {/* Candles */}
      {candles.map((c, i) => {
        const x = padding.left + i * gap + gap / 2;
        const bullish = c.close >= c.open;
        const bodyTop = yScale(Math.max(c.open, c.close));
        const bodyBottom = yScale(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBottom - bodyTop);
        const color = bullish ? "hsl(var(--success))" : "hsl(var(--destructive))";

        return (
          <g key={i}>
            {/* Wick */}
            <line x1={x} y1={yScale(c.high)} x2={x} y2={yScale(c.low)} stroke={color} strokeWidth="1" />
            {/* Body */}
            <rect x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyH} fill={bullish ? color : color} rx={1} />
          </g>
        );
      })}

      {/* Time labels */}
      {candles.filter((_, i) => i % Math.max(1, Math.floor(candles.length / 8)) === 0).map((c, idx, arr) => {
        const origIdx = candles.indexOf(c);
        const x = padding.left + origIdx * gap + gap / 2;
        return (
          <text key={`t-${idx}`} x={x} y={height - 5} fill="hsl(var(--muted-foreground))" fontSize="9" textAnchor="middle" fontFamily="monospace">
            {c.time}
          </text>
        );
      })}

      {/* Current price line */}
      {candles.length > 0 && (() => {
        const lastPrice = candles[candles.length - 1].close;
        const y = yScale(lastPrice);
        return (
          <g>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="6,3" opacity={0.8} />
            <rect x={width - padding.right} y={y - 10} width={55} height={20} rx={4} fill="hsl(var(--primary))" />
            <text x={width - padding.right + 27} y={y + 4} fill="hsl(var(--primary-foreground))" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              {lastPrice.toFixed(decimals)}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ─── Simulated Recent Activity ───
const ACTIVITY_NAMES = [
  "James W.", "Maria L.", "Ahmed K.", "Sophie B.", "Chen W.", "Olivia C.",
  "Raj P.", "Elena V.", "Liam O.", "Hana Y.", "Diego C.", "Nina S.",
  "Felix W.", "Amara J.", "Max H.", "Luna C.", "Patrick D.", "Zara K.",
];
const ACTIVITY_FLAGS = ["🇺🇸", "🇬🇧", "🇩🇪", "🇯🇵", "🇨🇦", "🇦🇺", "🇦🇪", "🇸🇬", "🇫🇷", "🇧🇷", "🇳🇱", "🇰🇷", "🇨🇭", "🇮🇳", "🇮🇹", "🇪🇸", "🇮🇪", "🇰🇪"];

type TradeActivity = { id: number; name: string; flag: string; pair: string; side: "buy" | "sell"; amount: number; profit: number; ts: number };

function useTradeActivity() {
  const [activities, setActivities] = useState<TradeActivity[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const generate = () => {
      const name = ACTIVITY_NAMES[Math.floor(Math.random() * ACTIVITY_NAMES.length)];
      const flag = ACTIVITY_FLAGS[Math.floor(Math.random() * ACTIVITY_FLAGS.length)];
      const pair = MARKET_PAIRS[Math.floor(Math.random() * MARKET_PAIRS.length)].displayName;
      const side = Math.random() > 0.45 ? "buy" : "sell" as const;
      const amount = Math.round(Math.random() * 15000 + 100);
      // 75% wins, 25% losses
      const profit = Math.random() < 0.75
        ? Math.round(Math.random() * amount * 0.15 + 10)
        : -Math.round(Math.random() * amount * 0.05 + 5);

      setActivities(prev => [{
        id: counterRef.current++,
        name, flag, pair, side, amount, profit, ts: Date.now(),
      }, ...prev.slice(0, 14)]);
    };

    generate();
    generate();
    generate();

    const schedule = () => {
      const delay = 4000 + Math.random() * 8000;
      return setTimeout(() => { generate(); schedule(); }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  return activities;
}

// ─── Main Component ───
const DashboardTrading = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const marketAssets = useMarketPrices(5000);
  const { format } = useCurrency();
  const fmt = (n: number) => format(n);

  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1m");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");

  const activities = useTradeActivity();

  const pairConfig = MARKET_PAIRS.find(p => p.displayName === selectedPair) ?? MARKET_PAIRS[0];
  const selectedAsset = marketAssets.find(a => a.displayName === selectedPair);
  const livePrice = selectedAsset?.price ?? pairConfig.basePrice;
  const change24h = selectedAsset?.change24h ?? (Math.random() * 6 - 1.5);
  const isUp = change24h >= 0;
  const decimals = livePrice < 1 ? 4 : livePrice < 100 ? 2 : 2;

  // Generate candles for selected pair/timeframe
  const candles = useMemo(() => {
    const count = timeframe === "1m" ? 60 : timeframe === "5m" ? 48 : timeframe === "15m" ? 40 : timeframe === "1H" ? 36 : timeframe === "4H" ? 30 : 30;
    const vol = timeframe === "1D" ? 0.035 : timeframe === "4H" ? 0.025 : 0.018;
    return generateCandles(livePrice, count, vol);
  }, [selectedPair, timeframe, livePrice]);

  // Note: actual P&L depends on market conditions
  const parsedAmount = parseFloat(amount) || 0;

  // Queries
  const { data: openTrades } = useQuery({
    queryKey: ["trades-open", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("user_id", user!.id).eq("status", "open").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const placeTrade = useMutation({
    mutationFn: async (tradeSide: "buy" | "sell") => {
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      const { error } = await supabase.from("trades").insert({
        user_id: user!.id, asset: selectedPair, side: tradeSide, amount: amt,
        price: price ? parseFloat(price) : livePrice,
        take_profit: tp ? parseFloat(tp) : null,
        stop_loss: sl ? parseFloat(sl) : null,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: (_, tradeSide) => {
      queryClient.invalidateQueries({ queryKey: ["trades-open", user?.id] });
      toast.success(`${tradeSide === "buy" ? "Buy" : "Sell"} order placed for ${selectedPair}`);
      setAmount(""); setPrice(""); setTp(""); setSl("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const closeTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      const trade = (openTrades ?? []).find(t => t.id === tradeId);
      if (!trade) throw new Error("Trade not found");

      // Simulate a realistic P&L based on trade amount (-10% to +15%)
      const pnlPct = (Math.random() * 0.25) - 0.10; // -10% to +15%
      const pnl = Number(trade.amount) * pnlPct;
      const roundedPnl = Math.round(pnl * 100) / 100;

      const { error } = await supabase.from("trades").update({
        status: "closed",
        closed_at: new Date().toISOString(),
        pnl: roundedPnl,
      }).eq("id", tradeId);
      if (error) throw error;

      // Update wallet balance with P&L
      const { data: prof } = await supabase.from("profiles").select("wallet_balance").eq("user_id", user!.id).single();
      if (prof) {
        const newBalance = Number(prof.wallet_balance) + Number(trade.amount) + roundedPnl;
        await supabase.from("profiles").update({ wallet_balance: Math.max(0, newBalance) }).eq("user_id", user!.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades-open", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast.success("Position closed. P&L applied to wallet.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-display font-bold text-foreground">Trading Terminal</h1>
          {marketAssets.length > 0 ? (
            <Badge variant="outline" className="text-[10px] border-success/30 text-success gap-1"><Wifi className="h-3 w-3" /> Connected</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground gap-1"><WifiOff className="h-3 w-3" /> Connecting</Badge>
          )}
        </div>
      </div>

      {/* Market Pairs Strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MARKET_PAIRS.map(pair => {
          const asset = marketAssets.find(a => a.displayName === pair.displayName);
          const p = asset?.price ?? pair.basePrice;
          const ch = asset?.change24h ?? 0;
          const up = ch >= 0;
          const active = selectedPair === pair.displayName;
          return (
            <button
              key={pair.symbol}
              onClick={() => setSelectedPair(pair.displayName)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm
                ${active ? "bg-primary/10 border-primary/40 shadow-sm" : "bg-card border-border hover:border-primary/20"}`}
            >
              <span className={`font-semibold ${active ? "text-primary" : "text-foreground"}`}>{pair.displayName}</span>
              <span className="text-foreground font-mono text-xs">{p < 1 ? p.toFixed(4) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span className={`text-[10px] font-medium ${up ? "text-success" : "text-destructive"}`}>
                {up ? "+" : ""}{ch.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart Area — col 1-8 */}
        <div className="lg:col-span-8 space-y-0">
          <Card className="bg-card border-border overflow-hidden">
            {/* Chart header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-lg font-display font-bold text-foreground">{selectedPair}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-mono text-foreground">{livePrice < 1 ? livePrice.toFixed(4) : livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${isUp ? "text-success" : "text-destructive"}`}>
                      {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {isUp ? "+" : ""}{change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              {/* Timeframe buttons */}
              <div className="flex gap-1">
                {TIMEFRAMES.map(tf => (
                  <Button
                    key={tf.label}
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2.5 text-xs font-mono ${timeframe === tf.label ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setTimeframe(tf.label)}
                  >
                    {tf.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Candlestick chart */}
            <CardContent className="p-2 pt-0">
              <CandlestickChart candles={candles} decimals={decimals} />
            </CardContent>
          </Card>

          {/* Order Book */}
          <div className="mt-4">
            <OrderBook price={livePrice} decimals={decimals} pair={selectedPair} />
          </div>

          {/* Open Positions */}
          <Card className="bg-card border-border mt-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Open Positions
                </CardTitle>
                <Badge variant="outline" className="text-xs">{(openTrades ?? []).length} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {(openTrades ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No open positions. Place a trade to get started.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 font-medium">Pair</th>
                        <th className="text-left py-2 font-medium">Side</th>
                        <th className="text-right py-2 font-medium">Amount</th>
                        <th className="text-right py-2 font-medium">Entry</th>
                        <th className="text-right py-2 font-medium">TP / SL</th>
                        <th className="text-right py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(openTrades ?? []).map(t => (
                        <tr key={t.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 font-medium text-foreground">{t.asset}</td>
                          <td className="py-2.5">
                            <Badge variant="outline" className={`text-[10px] ${t.side === "buy" ? "border-success/40 text-success" : "border-destructive/40 text-destructive"}`}>
                              {t.side.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-right text-foreground font-mono">${Number(t.amount).toLocaleString()}</td>
                          <td className="py-2.5 text-right text-foreground font-mono">{t.price ?? "Market"}</td>
                          <td className="py-2.5 text-right">
                            <span className="text-success">{t.take_profit ?? "—"}</span> / <span className="text-destructive">{t.stop_loss ?? "—"}</span>
                          </td>
                          <td className="py-2.5 text-right">
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => closeTrade.mutate(t.id)} disabled={closeTrade.isPending}>
                              Close
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel — col 9-12 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Trade Panel */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-4">
              {/* Buy/Sell toggle */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-semibold transition-all ${side === "buy" ? "bg-success text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setSide("buy")}
                >
                  <TrendingUp className="h-4 w-4 mr-1" /> Buy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-semibold transition-all ${side === "sell" ? "bg-destructive text-destructive-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setSide("sell")}
                >
                  <TrendingDown className="h-4 w-4 mr-1" /> Sell
                </Button>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price</label>
                <Input placeholder={`Market (${livePrice < 1 ? livePrice.toFixed(4) : livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })})`} value={price} onChange={e => setPrice(e.target.value)} type="number" className="font-mono" />
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount (USD)</label>
                <Input placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} type="number" className="font-mono" />
                <div className="flex gap-1 mt-1.5">
                  {["100", "500", "1000", "5000"].map(a => (
                    <Button key={a} variant="outline" size="sm" className="flex-1 text-[10px] h-6 font-mono" onClick={() => setAmount(a)}>${a}</Button>
                  ))}
                </div>
              </div>

              {/* TP / SL */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Take Profit</label>
                  <Input placeholder="Optional" value={tp} onChange={e => setTp(e.target.value)} type="number" className="font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Stop Loss</label>
                  <Input placeholder="Optional" value={sl} onChange={e => setSl(e.target.value)} type="number" className="font-mono text-xs" />
                </div>
              </div>

              {/* Estimated Profit */}
              {parsedAmount > 0 && (
                <div className="p-3 rounded-lg bg-success/5 border border-success/20 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Est. Profit (2.5%)</span>
                    <span className="text-success font-semibold font-mono">+{fmt(estimatedProfit)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Return</span>
                    <span className="text-foreground font-medium font-mono">{fmt(parsedAmount + estimatedProfit)}</span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                className={`w-full font-semibold text-sm ${side === "buy" ? "bg-success hover:bg-success/90 text-primary-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}`}
                onClick={() => placeTrade.mutate(side)}
                disabled={placeTrade.isPending || !amount}
              >
                {placeTrade.isPending ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${selectedPair}`}
              </Button>
            </CardContent>
          </Card>

          {/* Price Alerts */}
          <PriceAlerts
            currentPrices={Object.fromEntries(MARKET_PAIRS.map(p => {
              const asset = marketAssets.find(a => a.displayName === p.displayName);
              return [p.displayName, asset?.price ?? p.basePrice];
            }))}
            pairs={MARKET_PAIRS.map(p => p.displayName)}
          />

          {/* Recent Market Activity */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Market Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {activities.map(act => {
                  const secsAgo = Math.max(1, Math.floor((Date.now() - act.ts) / 1000));
                  const timeLabel = secsAgo < 5 ? "just now" : secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ago`;
                  const won = act.profit >= 0;
                  return (
                    <div key={act.id} className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{act.flag}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{act.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            <span className={act.side === "buy" ? "text-success" : "text-destructive"}>{act.side.toUpperCase()}</span> {act.pair}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-semibold font-mono ${won ? "text-success" : "text-destructive"}`}>
                          {won ? "+" : ""}{fmt(act.profit)}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{timeLabel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardTrading;
