import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useState } from "react";

const majorPairs = [
  { pair: "EUR/USD", price: "1.0842", change: "+0.12%", spread: "0.1", up: true },
  { pair: "GBP/USD", price: "1.2715", change: "+0.08%", spread: "0.3", up: true },
  { pair: "USD/JPY", price: "154.32", change: "-0.15%", spread: "0.2", up: false },
  { pair: "USD/CHF", price: "0.8834", change: "+0.05%", spread: "0.4", up: true },
  { pair: "AUD/USD", price: "0.6542", change: "-0.22%", spread: "0.3", up: false },
  { pair: "NZD/USD", price: "0.6128", change: "+0.03%", spread: "0.5", up: true },
];

const minorPairs = [
  { pair: "EUR/GBP", price: "0.8526", change: "+0.04%", spread: "0.5", up: true },
  { pair: "EUR/JPY", price: "167.25", change: "-0.08%", spread: "0.6", up: false },
  { pair: "GBP/JPY", price: "196.18", change: "+0.11%", spread: "0.8", up: true },
  { pair: "AUD/JPY", price: "100.95", change: "-0.14%", spread: "0.7", up: false },
  { pair: "EUR/AUD", price: "1.6573", change: "+0.06%", spread: "0.9", up: true },
  { pair: "GBP/AUD", price: "1.9438", change: "+0.09%", spread: "1.0", up: true },
];

const exoticPairs = [
  { pair: "USD/TRY", price: "34.285", change: "+0.35%", spread: "8.0", up: true },
  { pair: "USD/ZAR", price: "18.142", change: "-0.18%", spread: "5.0", up: false },
  { pair: "USD/MXN", price: "17.425", change: "+0.12%", spread: "4.5", up: true },
  { pair: "EUR/TRY", price: "37.168", change: "+0.28%", spread: "10.0", up: true },
  { pair: "USD/SGD", price: "1.3415", change: "-0.05%", spread: "1.2", up: false },
  { pair: "USD/HKD", price: "7.8102", change: "+0.01%", spread: "0.8", up: true },
];

type Tab = "major" | "minor" | "exotic";

const PairRow = ({ pair, price, change, spread, up }: { pair: string; price: string; change: string; spread: string; up: boolean }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
    <div className="flex items-center gap-3">
      {up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
      <span className="font-display font-semibold text-foreground">{pair}</span>
    </div>
    <div className="flex items-center gap-6 text-sm">
      <span className="font-mono text-foreground">{price}</span>
      <span className={`font-medium ${up ? "text-primary" : "text-destructive"}`}>{change}</span>
      <span className="text-muted-foreground hidden sm:block">Spread: {spread}</span>
      <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
        <Link to="/register">Trade</Link>
      </Button>
    </div>
  </div>
);

const MarketForex = () => {
  const [tab, setTab] = useState<Tab>("major");
  const pairs = tab === "major" ? majorPairs : tab === "minor" ? minorPairs : exoticPairs;

  return (
    <StaticPageLayout>
      <SEO title="Forex Trading | Vertex Global Markets" description="Trade 50+ forex currency pairs with tight spreads." path="/markets/forex" />
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
            {pairs.map((p) => (
              <PairRow key={p.pair} {...p} />
            ))}
          </div>

          {/* Chart Placeholder */}
          <Card className="bg-card border-border mb-12">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground text-lg">Live Trading Chart</h3>
              </div>
              <div className="h-64 rounded-xl bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">Interactive chart available in your trading dashboard</p>
              </div>
            </CardContent>
          </Card>

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
