import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useLivePrices } from "@/hooks/useLivePrices";
import MarketChart from "@/components/MarketChart";
import Sparkline from "@/components/Sparkline";

const forexConfigs = [
  // Major pairs (simulated with realistic bases)
  { displayName: "EUR/USD", basePrice: 1.0842, category: "major" },
  { displayName: "GBP/USD", basePrice: 1.2715, category: "major" },
  { displayName: "USD/JPY", basePrice: 154.32, category: "major" },
  { displayName: "USD/CHF", basePrice: 0.8834, category: "major" },
  { displayName: "AUD/USD", basePrice: 0.6542, category: "major" },
  { displayName: "NZD/USD", basePrice: 0.6128, category: "major" },
  // Minor pairs
  { displayName: "EUR/GBP", basePrice: 0.8526, category: "minor" },
  { displayName: "EUR/JPY", basePrice: 167.25, category: "minor" },
  { displayName: "GBP/JPY", basePrice: 196.18, category: "minor" },
  { displayName: "AUD/JPY", basePrice: 100.95, category: "minor" },
  { displayName: "EUR/AUD", basePrice: 1.6573, category: "minor" },
  { displayName: "GBP/AUD", basePrice: 1.9438, category: "minor" },
  // Exotic pairs
  { displayName: "USD/TRY", basePrice: 34.285, category: "exotic" },
  { displayName: "USD/ZAR", basePrice: 18.142, category: "exotic" },
  { displayName: "USD/MXN", basePrice: 17.425, category: "exotic" },
  { displayName: "EUR/TRY", basePrice: 37.168, category: "exotic" },
  { displayName: "USD/SGD", basePrice: 1.3415, category: "exotic" },
  { displayName: "USD/HKD", basePrice: 7.8102, category: "exotic" },
];

const spreads: Record<string, string> = {
  "EUR/USD": "0.1", "GBP/USD": "0.3", "USD/JPY": "0.2", "USD/CHF": "0.4",
  "AUD/USD": "0.3", "NZD/USD": "0.5", "EUR/GBP": "0.5", "EUR/JPY": "0.6",
  "GBP/JPY": "0.8", "AUD/JPY": "0.7", "EUR/AUD": "0.9", "GBP/AUD": "1.0",
  "USD/TRY": "8.0", "USD/ZAR": "5.0", "USD/MXN": "4.5", "EUR/TRY": "10.0",
  "USD/SGD": "1.2", "USD/HKD": "0.8",
};

type Tab = "major" | "minor" | "exotic";

const MarketForex = () => {
  const [tab, setTab] = useState<Tab>("major");

  const hookConfigs = useMemo(() => forexConfigs.map((c) => ({
    displayName: c.displayName,
    basePrice: c.basePrice,
  })), []);

  const livePrices = useLivePrices(hookConfigs, 4000);

  const filteredPairs = forexConfigs.filter((c) => c.category === tab);

  const getPriceData = (displayName: string) => {
    return livePrices.find((p) => p.displayName === displayName);
  };

  const formatPrice = (price: number, name: string) => {
    if (name.includes("JPY") || name.includes("TRY") || name.includes("ZAR") || name.includes("MXN") || name.includes("HKD")) {
      return price.toFixed(3);
    }
    return price.toFixed(4);
  };

  return (
    <StaticPageLayout>
      <SEO title="Forex Trading | Vertex Global Markets" description="Trade 50+ forex currency pairs with tight spreads and live prices." path="/markets/forex" />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-5xl mb-4">💱</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Forex <span className="text-gradient-brand">Trading</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Trade 50+ major, minor, and exotic currency pairs with tight spreads and up to 1:500 leverage.
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Live Prices · Updates every 4s</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Currency Pairs", value: "50+" },
              { label: "Min Spread", value: "0.1 pips" },
              { label: "Max Leverage", value: "1:500" },
              { label: "Trading Hours", value: "24/5" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["major", "minor", "exotic"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t} Pairs
              </button>
            ))}
          </div>

          {/* Pair List */}
          <div className="space-y-3 mb-12">
            {filteredPairs.map((pair) => {
              const data = getPriceData(pair.displayName);
              const price = data?.price ?? pair.basePrice;
              const change = data?.change24h ?? 0;
              const up = change >= 0;
              const flash = data && data.price !== data.prevPrice;

              return (
                <div
                  key={pair.displayName}
                  className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all ${
                    flash ? "ring-1 ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <span className="font-display font-semibold text-foreground">{pair.displayName}</span>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 text-sm">
                    <span className={`font-mono text-foreground transition-colors ${flash ? (up ? "text-primary" : "text-destructive") : ""}`}>
                      {formatPrice(price, pair.displayName)}
                    </span>
                    <span className={`font-medium ${up ? "text-primary" : "text-destructive"}`}>
                      {up ? "+" : ""}{change.toFixed(2)}%
                    </span>
                    <Sparkline basePrice={pair.basePrice} change={change} />
                    <span className="text-muted-foreground hidden sm:block">
                      Spread: {spreads[pair.displayName] ?? "—"}
                    </span>
                    <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
                      <Link to="/register">Trade</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Chart */}
          <div className="mb-12">
            <MarketChart
              title="EUR/USD"
              basePrice={1.0842}
              symbol="EUR/USD"
              livePrice={getPriceData("EUR/USD")?.price}
            />
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
              <Link to="/register">Start Trading Forex</Link>
            </Button>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default MarketForex;
