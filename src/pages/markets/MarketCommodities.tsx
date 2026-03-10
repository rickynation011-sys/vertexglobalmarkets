import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";

const commodities = [
  { name: "Gold", symbol: "XAU/USD", price: "$2,342.50", change: "+0.85%", up: true, category: "Metals" },
  { name: "Silver", symbol: "XAG/USD", price: "$29.45", change: "+1.12%", up: true, category: "Metals" },
  { name: "Platinum", symbol: "XPT/USD", price: "$985.30", change: "-0.32%", up: false, category: "Metals" },
  { name: "Palladium", symbol: "XPD/USD", price: "$1,012.80", change: "-0.55%", up: false, category: "Metals" },
  { name: "WTI Crude Oil", symbol: "CL", price: "$78.45", change: "+1.25%", up: true, category: "Energy" },
  { name: "Brent Crude Oil", symbol: "BRN", price: "$82.18", change: "+0.98%", up: true, category: "Energy" },
  { name: "Natural Gas", symbol: "NG", price: "$2.85", change: "-2.15%", up: false, category: "Energy" },
  { name: "Copper", symbol: "HG", price: "$4.25", change: "+0.45%", up: true, category: "Metals" },
  { name: "Wheat", symbol: "ZW", price: "$585.50", change: "-0.78%", up: false, category: "Agriculture" },
  { name: "Corn", symbol: "ZC", price: "$445.25", change: "+0.32%", up: true, category: "Agriculture" },
  { name: "Soybeans", symbol: "ZS", price: "$1,185.75", change: "+0.15%", up: true, category: "Agriculture" },
  { name: "Coffee", symbol: "KC", price: "$182.40", change: "+1.85%", up: true, category: "Agriculture" },
];

const MarketCommodities = () => (
  <StaticPageLayout>
    <SEO title="Commodity Trading | Vertex Global Markets" description="Trade 30+ commodities including gold, silver, oil, natural gas and agricultural products." path="/markets/commodities" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Commodity <span className="text-gradient-brand">Trading</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Trade gold, silver, oil, natural gas, and agricultural products with competitive margins.
          </p>
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

        {["Metals", "Energy", "Agriculture"].map((cat) => (
          <div key={cat} className="mb-8">
            <h3 className="font-display font-semibold text-foreground text-lg mb-4">{cat}</h3>
            <div className="space-y-3">
              {commodities.filter((c) => c.category === cat).map((c) => (
                <div key={c.symbol} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {c.up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <div>
                      <span className="font-display font-semibold text-foreground">{c.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{c.symbol}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 text-sm">
                    <span className="font-mono text-foreground">{c.price}</span>
                    <span className={`font-medium ${c.up ? "text-primary" : "text-destructive"}`}>{c.change}</span>
                    <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
                      <Link to="/register">Trade</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-8">
          <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Start Trading Commodities</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default MarketCommodities;
