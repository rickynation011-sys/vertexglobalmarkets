import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, BarChart3, Clock } from "lucide-react";

const coins = [
  { name: "Bitcoin", symbol: "BTC", price: "$67,432.50", change: "+2.35%", mcap: "$1.32T", up: true },
  { name: "Ethereum", symbol: "ETH", price: "$3,542.18", change: "+1.82%", mcap: "$425B", up: true },
  { name: "Solana", symbol: "SOL", price: "$178.45", change: "-0.95%", mcap: "$78B", up: false },
  { name: "XRP", symbol: "XRP", price: "$2.18", change: "+5.12%", mcap: "$124B", up: true },
  { name: "Cardano", symbol: "ADA", price: "$0.682", change: "-1.24%", mcap: "$24B", up: false },
  { name: "Dogecoin", symbol: "DOGE", price: "$0.1245", change: "+3.67%", mcap: "$18B", up: true },
  { name: "Avalanche", symbol: "AVAX", price: "$38.92", change: "+0.78%", mcap: "$15B", up: true },
  { name: "Chainlink", symbol: "LINK", price: "$18.45", change: "-0.42%", mcap: "$11B", up: false },
  { name: "Polkadot", symbol: "DOT", price: "$7.85", change: "+1.15%", mcap: "$10B", up: true },
  { name: "Polygon", symbol: "MATIC", price: "$0.892", change: "+0.55%", mcap: "$8.9B", up: true },
];

const MarketCrypto = () => (
  <StaticPageLayout>
    <SEO title="Crypto Trading | Vertex Global Markets" description="Trade 200+ cryptocurrencies including Bitcoin, Ethereum and altcoins 24/7." path="/markets/crypto" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-5xl mb-4">₿</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Crypto <span className="text-gradient-brand">Trading</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Access Bitcoin, Ethereum, and 200+ altcoins — trade crypto 24/7 with no downtime.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Cryptocurrencies", value: "200+" },
            { label: "Trading", value: "24/7", icon: <Clock className="h-4 w-4 text-primary mx-auto mb-1" /> },
            { label: "Min Trade", value: "$1" },
            { label: "Max Leverage", value: "1:100" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
              {s.icon}
              <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-primary font-medium">Markets Open 24/7</span>
        </div>

        <div className="space-y-3 mb-12">
          {coins.map((c) => (
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
                <span className="text-muted-foreground hidden md:block">{c.mcap}</span>
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
              <h3 className="font-display font-semibold text-foreground text-lg">Live Crypto Chart</h3>
            </div>
            <div className="h-64 rounded-xl bg-muted/50 flex items-center justify-center">
              <p className="text-muted-foreground">Interactive chart available in your trading dashboard</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Start Trading Crypto</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default MarketCrypto;
