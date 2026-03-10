import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { useLivePrices } from "@/hooks/useLivePrices";

const indexConfigs = [
  { displayName: "S&P 500", symbol: "SPX", basePrice: 5425.80, region: "US" },
  { displayName: "NASDAQ 100", symbol: "NDX", basePrice: 18952.30, region: "US" },
  { displayName: "Dow Jones", symbol: "DJI", basePrice: 39872.45, region: "US" },
  { displayName: "FTSE 100", symbol: "UKX", basePrice: 8245.60, region: "Europe" },
  { displayName: "DAX 40", symbol: "DAX", basePrice: 18125.40, region: "Europe" },
  { displayName: "CAC 40", symbol: "CAC", basePrice: 7658.90, region: "Europe" },
  { displayName: "Nikkei 225", symbol: "NKY", basePrice: 38425.15, region: "Asia" },
  { displayName: "Hang Seng", symbol: "HSI", basePrice: 18142.30, region: "Asia" },
  { displayName: "ASX 200", symbol: "AS51", basePrice: 7892.45, region: "Asia" },
  { displayName: "Euro Stoxx 50", symbol: "SX5E", basePrice: 4985.20, region: "Europe" },
];

const regions = ["US", "Europe", "Asia"];

const MarketIndices = () => {
  const hookConfigs = useMemo(() => indexConfigs.map((i) => ({
    displayName: i.displayName,
    basePrice: i.basePrice,
  })), []);

  const livePrices = useLivePrices(hookConfigs, 4000);

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <StaticPageLayout>
      <SEO title="Index Trading | Vertex Global Markets" description="Trade 20+ global indices including S&P 500, FTSE, DAX, Nikkei with live prices." path="/markets/indices" />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Index <span className="text-gradient-brand">Trading</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Gain exposure to S&P 500, FTSE, DAX, Nikkei, and 20+ global indices with live price updates.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Live Prices · Updates every 4s</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Indices", value: "20+" },
              { label: "Regions", value: "Global" },
              { label: "Commission", value: "$0" },
              { label: "Max Leverage", value: "1:200" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {regions.map((region) => {
            const items = indexConfigs.filter((i) => i.region === region);
            return (
              <div key={region} className="mb-8">
                <h3 className="font-display font-semibold text-foreground text-lg mb-4">{region}</h3>
                <div className="space-y-3">
                  {items.map((idx) => {
                    const data = livePrices.find((p) => p.displayName === idx.displayName);
                    const price = data?.price ?? idx.basePrice;
                    const change = data?.change24h ?? 0;
                    const up = change >= 0;
                    const flash = data && data.price !== data.prevPrice;

                    return (
                      <div
                        key={idx.symbol}
                        className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all ${
                          flash ? "ring-1 ring-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                          <div>
                            <span className="font-display font-semibold text-foreground">{idx.displayName}</span>
                            <span className="text-xs text-muted-foreground ml-2">{idx.symbol}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6 text-sm">
                          <span className={`font-mono text-foreground transition-colors ${flash ? (up ? "text-primary" : "text-destructive") : ""}`}>
                            {formatPrice(price)}
                          </span>
                          <span className={`font-medium ${up ? "text-primary" : "text-destructive"}`}>
                            {up ? "+" : ""}{change.toFixed(2)}%
                          </span>
                          <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
                            <Link to="/register">Trade</Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
              <Link to="/register">Start Trading Indices</Link>
            </Button>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default MarketIndices;
