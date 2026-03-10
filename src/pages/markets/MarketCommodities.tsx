import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { useLivePrices } from "@/hooks/useLivePrices";

const commodityConfigs = [
  // Metals — Gold & Silver tracked via Binance pairs (PAXG is gold-backed token)
  { displayName: "Gold (XAU)", binanceSymbol: "PAXGUSDT", basePrice: 2342.50, category: "Metals" },
  { displayName: "Silver (XAG)", basePrice: 29.45, category: "Metals" },
  { displayName: "Platinum (XPT)", basePrice: 985.30, category: "Metals" },
  { displayName: "Palladium (XPD)", basePrice: 1012.80, category: "Metals" },
  { displayName: "Copper (HG)", basePrice: 4.25, category: "Metals" },
  // Energy
  { displayName: "WTI Crude Oil", basePrice: 78.45, category: "Energy" },
  { displayName: "Brent Crude Oil", basePrice: 82.18, category: "Energy" },
  { displayName: "Natural Gas", basePrice: 2.85, category: "Energy" },
  // Agriculture
  { displayName: "Wheat", basePrice: 585.50, category: "Agriculture" },
  { displayName: "Corn", basePrice: 445.25, category: "Agriculture" },
  { displayName: "Soybeans", basePrice: 1185.75, category: "Agriculture" },
  { displayName: "Coffee", basePrice: 182.40, category: "Agriculture" },
];

const categories = ["Metals", "Energy", "Agriculture"];

const MarketCommodities = () => {
  const hookConfigs = useMemo(() => commodityConfigs.map((c) => ({
    displayName: c.displayName,
    binanceSymbol: c.binanceSymbol,
    basePrice: c.basePrice,
  })), []);

  const livePrices = useLivePrices(hookConfigs, 4000);

  const formatPrice = (price: number) => {
    if (price >= 100) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(2)}`;
  };

  return (
    <StaticPageLayout>
      <SEO title="Commodity Trading | Vertex Global Markets" description="Trade 30+ commodities with live prices — gold, silver, oil, natural gas and agricultural products." path="/markets/commodities" />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-5xl mb-4">🏆</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Commodity <span className="text-gradient-brand">Trading</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Trade gold, silver, oil, natural gas, and agricultural products with live price updates.
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Live Prices · Updates every 4s</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Commodities", value: "30+" },
              { label: "Categories", value: "3" },
              { label: "Min Spread", value: "0.3" },
              { label: "Max Leverage", value: "1:200" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {categories.map((cat) => {
            const items = commodityConfigs.filter((c) => c.category === cat);
            return (
              <div key={cat} className="mb-8">
                <h3 className="font-display font-semibold text-foreground text-lg mb-4">{cat}</h3>
                <div className="space-y-3">
                  {items.map((commodity) => {
                    const data = livePrices.find((p) => p.displayName === commodity.displayName);
                    const price = data?.price ?? commodity.basePrice;
                    const change = data?.change24h ?? 0;
                    const up = change >= 0;
                    const flash = data && data.price !== data.prevPrice;

                    return (
                      <div
                        key={commodity.displayName}
                        className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all ${
                          flash ? "ring-1 ring-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                          <div>
                            <span className="font-display font-semibold text-foreground">{commodity.displayName.split(" (")[0]}</span>
                            {commodity.displayName.includes("(") && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {commodity.displayName.match(/\((.+)\)/)?.[1]}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6 text-sm">
                          <span className={`font-mono text-foreground transition-colors ${flash ? (up ? "text-primary" : "text-destructive") : ""}`}>
                            {formatPrice(price)}
                          </span>
                          <span className={`font-medium ${up ? "text-primary" : "text-destructive"}`}>
                            {up ? "+" : ""}{change.toFixed(2)}%
                          </span>
                          {data?.source === "binance" && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded hidden md:block">LIVE</span>
                          )}
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
              <Link to="/register">Start Trading Commodities</Link>
            </Button>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default MarketCommodities;
