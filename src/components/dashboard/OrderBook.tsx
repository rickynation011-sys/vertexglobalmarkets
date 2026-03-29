import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderBookProps {
  price: number;
  decimals: number;
  pair: string;
}

type OrderLevel = { price: number; amount: number; total: number };

function generateLevels(basePrice: number, count: number, side: "bid" | "ask", spread: number): OrderLevel[] {
  const levels: OrderLevel[] = [];
  let running = 0;
  for (let i = 0; i < count; i++) {
    const offset = (i + 1) * spread * (0.8 + Math.random() * 0.4);
    const p = side === "bid" ? basePrice - offset : basePrice + offset;
    const amount = Math.random() * 5 + 0.01;
    running += amount;
    levels.push({ price: p, amount, total: running });
  }
  return levels;
}

const OrderBook = ({ price, decimals, pair }: OrderBookProps) => {
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const spread = useMemo(() => {
    if (price > 10000) return price * 0.0003;
    if (price > 100) return price * 0.0005;
    if (price > 1) return price * 0.001;
    return price * 0.002;
  }, [price]);

  useEffect(() => {
    const update = () => {
      const jitter = (Math.random() - 0.5) * spread * 2;
      const currentPrice = price + jitter;
      setBids(generateLevels(currentPrice, 12, "bid", spread));
      setAsks(generateLevels(currentPrice, 12, "ask", spread).reverse());
    };

    update();
    intervalRef.current = setInterval(update, 2000 + Math.random() * 1000);
    return () => clearInterval(intervalRef.current);
  }, [price, spread]);

  const maxTotal = Math.max(
    ...bids.map(b => b.total),
    ...asks.map(a => a.total),
    1
  );

  const fmtPrice = (p: number) => p.toFixed(decimals);
  const fmtAmt = (a: number) => a < 0.01 ? a.toFixed(4) : a < 1 ? a.toFixed(3) : a.toFixed(2);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Order Book</CardTitle>
          <Badge variant="outline" className="text-[10px]">{pair}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-muted-foreground font-medium border-b border-border">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (sells) */}
        <div className="relative">
          {asks.map((level, i) => (
            <div key={`ask-${i}`} className="relative grid grid-cols-3 px-3 py-[3px] text-[11px] font-mono">
              <div
                className="absolute inset-y-0 right-0 bg-destructive/8"
                style={{ width: `${(level.total / maxTotal) * 100}%` }}
              />
              <span className="text-destructive relative z-10">{fmtPrice(level.price)}</span>
              <span className="text-right text-foreground/70 relative z-10">{fmtAmt(level.amount)}</span>
              <span className="text-right text-foreground/50 relative z-10">{fmtAmt(level.total)}</span>
            </div>
          ))}
        </div>

        {/* Spread / Current price */}
        <div className="px-3 py-2 border-y border-border bg-muted/30 flex items-center justify-between">
          <span className="text-sm font-mono font-bold text-foreground">{fmtPrice(price)}</span>
          <span className="text-[10px] text-muted-foreground">Spread: {fmtPrice(spread * 2)}</span>
        </div>

        {/* Bids (buys) */}
        <div className="relative">
          {bids.map((level, i) => (
            <div key={`bid-${i}`} className="relative grid grid-cols-3 px-3 py-[3px] text-[11px] font-mono">
              <div
                className="absolute inset-y-0 right-0 bg-success/8"
                style={{ width: `${(level.total / maxTotal) * 100}%` }}
              />
              <span className="text-success relative z-10">{fmtPrice(level.price)}</span>
              <span className="text-right text-foreground/70 relative z-10">{fmtAmt(level.amount)}</span>
              <span className="text-right text-foreground/50 relative z-10">{fmtAmt(level.total)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderBook;
