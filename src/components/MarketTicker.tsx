import { TrendingUp, TrendingDown } from "lucide-react";

const markets = [
  { symbol: "BTC/USD", price: "67,842.50", change: "+2.34%", up: true },
  { symbol: "ETH/USD", price: "3,521.80", change: "+1.87%", up: true },
  { symbol: "EUR/USD", price: "1.0842", change: "-0.12%", up: false },
  { symbol: "AAPL", price: "189.42", change: "+0.95%", up: true },
  { symbol: "GOLD", price: "2,342.60", change: "+0.43%", up: true },
  { symbol: "S&P 500", price: "5,234.18", change: "+0.67%", up: true },
  { symbol: "GBP/USD", price: "1.2718", change: "-0.23%", up: false },
  { symbol: "SOL/USD", price: "142.38", change: "+4.12%", up: true },
  { symbol: "OIL", price: "78.42", change: "-0.89%", up: false },
  { symbol: "TSLA", price: "248.50", change: "+1.32%", up: true },
];

const MarketTicker = () => {
  return (
    <div className="relative overflow-hidden border-y border-border bg-card/30 py-3">
      <div className="flex gap-8 ticker-scroll" style={{ width: "max-content" }}>
        {[...markets, ...markets].map((m, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-display font-semibold text-foreground">{m.symbol}</span>
            <span className="text-sm text-muted-foreground">{m.price}</span>
            <span className={`flex items-center gap-1 text-xs font-medium ${m.up ? "text-success" : "text-destructive"}`}>
              {m.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {m.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
