import { useRef, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMarketPrices } from "@/hooks/useMarketPrices";

const TickerItem = ({ m, idx }: { m: ReturnType<typeof useMarketPrices>[number]; idx: number }) => {
  const up = m.change24h >= 0;
  const prevPrice = useRef(m.price);
  const priceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = priceRef.current;
    if (!el || prevPrice.current === m.price) return;

    const flash = m.price > prevPrice.current ? "ticker-flash-up" : "ticker-flash-down";
    el.classList.remove("ticker-flash-up", "ticker-flash-down");
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add(flash);
    prevPrice.current = m.price;
  }, [m.price]);

  return (
    <div className="flex items-center gap-3 shrink-0">
      <span className="text-sm font-display font-semibold text-foreground">{m.displayName}</span>
      <span
        ref={priceRef}
        className="text-sm text-muted-foreground font-mono rounded px-1 transition-colors"
      >
        {m.price < 10 ? m.price.toFixed(4) : m.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
      <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-success" : "text-destructive"}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? "+" : ""}{m.change24h.toFixed(2)}%
      </span>
    </div>
  );
};

const MarketTicker = () => {
  const assets = useMarketPrices(5000);

  if (assets.length === 0) return null;

  const items = [...assets, ...assets];

  return (
    <div className="relative overflow-hidden border-y border-border bg-card/30 py-3">
      <div className="flex gap-8 ticker-scroll" style={{ width: "max-content" }}>
        {items.map((m, i) => (
          <TickerItem key={i} m={m} idx={i} />
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
