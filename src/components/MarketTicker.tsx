import { TrendingUp, TrendingDown } from "lucide-react";
import { useMarketPrices } from "@/hooks/useMarketPrices";

const MarketTicker = () => {
  const assets = useMarketPrices(5000);

  if (assets.length === 0) return null;

  const items = [...assets, ...assets]; // duplicate for seamless scroll

  return (
    <div className="relative overflow-hidden border-y border-border bg-card/30 py-3">
      <div className="flex gap-8 ticker-scroll" style={{ width: "max-content" }}>
        {items.map((m, i) => {
          const up = m.change24h >= 0;
          return (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-display font-semibold text-foreground">{m.displayName}</span>
              <span className="text-sm text-muted-foreground font-mono">
                {m.price < 10 ? m.price.toFixed(4) : m.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-success" : "text-destructive"}`}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {up ? "+" : ""}{m.change24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketTicker;
