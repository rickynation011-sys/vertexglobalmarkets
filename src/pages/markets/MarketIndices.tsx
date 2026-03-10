import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";

const indices = [
  { name: "S&P 500", symbol: "SPX", price: "5,425.80", change: "+0.65%", region: "US", up: true },
  { name: "NASDAQ 100", symbol: "NDX", price: "18,952.30", change: "+1.12%", region: "US", up: true },
  { name: "Dow Jones", symbol: "DJI", price: "39,872.45", change: "+0.28%", region: "US", up: true },
  { name: "FTSE 100", symbol: "UKX", price: "8,245.60", change: "-0.18%", region: "Europe", up: false },
  { name: "DAX 40", symbol: "DAX", price: "18,125.40", change: "+0.42%", region: "Europe", up: true },
  { name: "CAC 40", symbol: "CAC", price: "7,658.90", change: "-0.35%", region: "Europe", up: false },
  { name: "Nikkei 225", symbol: "NKY", price: "38,425.15", change: "+0.82%", region: "Asia", up: true },
  { name: "Hang Seng", symbol: "HSI", price: "18,142.30", change: "-0.55%", region: "Asia", up: false },
  { name: "ASX 200", symbol: "AS51", price: "7,892.45", change: "+0.15%", region: "Asia", up: true },
  { name: "Euro Stoxx 50", symbol: "SX5E", price: "4,985.20", change: "+0.38%", region: "Europe", up: true },
];

const MarketIndices = () => (
  <StaticPageLayout>
    <SEO title="Index Trading | Vertex Global Markets" description="Trade 20+ global indices including S&P 500, FTSE, DAX, Nikkei." path="/markets/indices" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Index <span className="text-gradient-brand">Trading</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Gain exposure to S&P 500, FTSE, DAX, Nikkei, and 20+ global indices.
          </p>
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

        {["US", "Europe", "Asia"].map((region) => (
          <div key={region} className="mb-8">
            <h3 className="font-display font-semibold text-foreground text-lg mb-4">{region}</h3>
            <div className="space-y-3">
              {indices.filter((i) => i.region === region).map((idx) => (
                <div key={idx.symbol} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {idx.up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <div>
                      <span className="font-display font-semibold text-foreground">{idx.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{idx.symbol}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 text-sm">
                    <span className="font-mono text-foreground">{idx.price}</span>
                    <span className={`font-medium ${idx.up ? "text-primary" : "text-destructive"}`}>{idx.change}</span>
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
            <Link to="/register">Start Trading Indices</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default MarketIndices;
