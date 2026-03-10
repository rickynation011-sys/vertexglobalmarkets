import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useLivePrices } from "@/hooks/useLivePrices";
import MarketChart from "@/components/MarketChart";
import Sparkline from "@/components/Sparkline";

const stockConfigs = [
  { displayName: "Apple Inc.", symbol: "AAPL", basePrice: 198.45, exchange: "NASDAQ" },
  { displayName: "Tesla Inc.", symbol: "TSLA", basePrice: 245.12, exchange: "NASDAQ" },
  { displayName: "Amazon.com", symbol: "AMZN", basePrice: 185.67, exchange: "NASDAQ" },
  { displayName: "Microsoft", symbol: "MSFT", basePrice: 415.32, exchange: "NASDAQ" },
  { displayName: "NVIDIA", symbol: "NVDA", basePrice: 875.28, exchange: "NASDAQ" },
  { displayName: "Alphabet", symbol: "GOOGL", basePrice: 165.89, exchange: "NASDAQ" },
  { displayName: "Meta Platforms", symbol: "META", basePrice: 512.45, exchange: "NASDAQ" },
  { displayName: "JPMorgan Chase", symbol: "JPM", basePrice: 198.34, exchange: "NYSE" },
  { displayName: "Shell plc", symbol: "SHEL", basePrice: 68.85, exchange: "LSE" },
  { displayName: "Toyota Motor", symbol: "TM", basePrice: 182.10, exchange: "NYSE" },
];

const MarketStocks = () => {
  const [search, setSearch] = useState("");

  const hookConfigs = useMemo(() => stockConfigs.map((s) => ({
    displayName: s.displayName,
    basePrice: s.basePrice,
  })), []);

  const livePrices = useLivePrices(hookConfigs, 4000);

  const filtered = stockConfigs.filter(
    (s) => s.displayName.toLowerCase().includes(search.toLowerCase()) || s.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const withPrices = filtered.map((s) => {
    const data = livePrices.find((p) => p.displayName === s.displayName);
    return { ...s, price: data?.price ?? s.basePrice, change: data?.change24h ?? 0, flash: data ? data.price !== data.prevPrice : false };
  });

  const gainers = withPrices.filter((s) => s.change >= 0).sort((a, b) => b.change - a.change);
  const losers = withPrices.filter((s) => s.change < 0).sort((a, b) => a.change - b.change);

  return (
    <StaticPageLayout>
      <SEO title="Stock Trading | Vertex Global Markets" description="Invest in 5,000+ equities from NYSE, NASDAQ, LSE with live price updates." path="/markets/stocks" />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-5xl mb-4">📈</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Stock <span className="text-gradient-brand">Trading</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Invest in 5,000+ global equities from NYSE, NASDAQ, LSE, and more leading exchanges.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Live Prices · Updates every 4s</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Equities", value: "5,000+" },
              { label: "Exchanges", value: "20+" },
              { label: "Commission", value: "$0" },
              { label: "Fractional Shares", value: "Yes" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Top Gainers / Losers */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Top Gainers
                </h3>
                <div className="space-y-3">
                  {gainers.slice(0, 4).map((s) => (
                    <div key={s.symbol} className="flex justify-between items-center">
                      <span className="text-sm text-foreground font-medium">{s.symbol}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-foreground">${s.price.toFixed(2)}</span>
                        <span className="text-sm text-primary font-medium">+{s.change.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" /> Top Losers
                </h3>
                <div className="space-y-3">
                  {losers.slice(0, 4).map((s) => (
                    <div key={s.symbol} className="flex justify-between items-center">
                      <span className="text-sm text-foreground font-medium">{s.symbol}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-foreground">${s.price.toFixed(2)}</span>
                        <span className="text-sm text-destructive font-medium">{s.change.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & List */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search stocks by name or symbol..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="space-y-3 mb-12">
            {withPrices.map((s) => {
              const up = s.change >= 0;
              return (
                <div
                  key={s.symbol}
                  className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all ${
                    s.flash ? "ring-1 ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <div>
                      <span className="font-display font-semibold text-foreground">{s.displayName}</span>
                      <span className="text-xs text-muted-foreground ml-2">{s.symbol} · {s.exchange}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 text-sm">
                    <span className={`font-mono text-foreground transition-colors ${s.flash ? (up ? "text-primary" : "text-destructive") : ""}`}>
                      ${s.price.toFixed(2)}
                    </span>
                    <span className={`font-medium ${up ? "text-primary" : "text-destructive"}`}>
                      {up ? "+" : ""}{s.change.toFixed(2)}%
                    </span>
                    <Sparkline basePrice={s.basePrice} change={s.change} />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 font-semibold" asChild>
                        <Link to="/register">Buy</Link>
                      </Button>
                      <Button size="sm" variant="outline" className="font-semibold" asChild>
                        <Link to="/register">Sell</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-12">
            <MarketChart
              title="Apple Inc. (AAPL)"
              basePrice={198.45}
              symbol="AAPL · NASDAQ"
              livePrice={withPrices.find((s) => s.symbol === "AAPL")?.price}
            />
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
              <Link to="/register">Start Trading Stocks</Link>
            </Button>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default MarketStocks;
