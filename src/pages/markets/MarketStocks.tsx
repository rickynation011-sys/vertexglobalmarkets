import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, BarChart3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const allStocks = [
  { name: "Apple Inc.", symbol: "AAPL", price: "$198.45", change: "+1.24%", exchange: "NASDAQ", up: true },
  { name: "Tesla Inc.", symbol: "TSLA", price: "$245.12", change: "+3.85%", exchange: "NASDAQ", up: true },
  { name: "Amazon.com", symbol: "AMZN", price: "$185.67", change: "-0.42%", exchange: "NASDAQ", up: false },
  { name: "Microsoft", symbol: "MSFT", price: "$415.32", change: "+0.95%", exchange: "NASDAQ", up: true },
  { name: "NVIDIA", symbol: "NVDA", price: "$875.28", change: "+2.15%", exchange: "NASDAQ", up: true },
  { name: "Alphabet", symbol: "GOOGL", price: "$165.89", change: "-0.18%", exchange: "NASDAQ", up: false },
  { name: "Meta Platforms", symbol: "META", price: "$512.45", change: "+1.67%", exchange: "NASDAQ", up: true },
  { name: "JPMorgan Chase", symbol: "JPM", price: "$198.34", change: "+0.52%", exchange: "NYSE", up: true },
  { name: "Shell plc", symbol: "SHEL", price: "£26.85", change: "-0.65%", exchange: "LSE", up: false },
  { name: "Toyota Motor", symbol: "TM", price: "$182.10", change: "+0.38%", exchange: "NYSE", up: true },
];

const gainers = allStocks.filter((s) => s.up).sort((a, b) => parseFloat(b.change) - parseFloat(a.change));
const losers = allStocks.filter((s) => !s.up);

const MarketStocks = () => {
  const [search, setSearch] = useState("");
  const filtered = allStocks.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StaticPageLayout>
      <SEO title="Stock Trading | Vertex Global Markets" description="Invest in 5,000+ equities from NYSE, NASDAQ, LSE and more." path="/markets/stocks" />
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
                      <span className="text-sm text-primary font-medium">{s.change}</span>
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
                      <span className="text-sm text-destructive font-medium">{s.change}</span>
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
            {filtered.map((s) => (
              <div key={s.symbol} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  {s.up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                  <div>
                    <span className="font-display font-semibold text-foreground">{s.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{s.symbol} · {s.exchange}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 text-sm">
                  <span className="font-mono text-foreground">{s.price}</span>
                  <span className={`font-medium ${s.up ? "text-primary" : "text-destructive"}`}>{s.change}</span>
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
            ))}
          </div>

          <Card className="bg-card border-border mb-12">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground text-lg">Live Stock Chart</h3>
              </div>
              <div className="h-64 rounded-xl bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">Interactive chart available in your trading dashboard</p>
              </div>
            </CardContent>
          </Card>

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
