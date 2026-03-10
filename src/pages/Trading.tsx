import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, BarChart3, Shield, Clock, TrendingUp, Layers } from "lucide-react";

const features = [
  { icon: Zap, title: "Ultra-Fast Execution", description: "Average execution speed under 30ms with 99.99% uptime. No requotes, no dealing desk interference." },
  { icon: BarChart3, title: "Advanced Charting", description: "Professional-grade charting with 100+ technical indicators, drawing tools, and customizable timeframes from 1s to 1M." },
  { icon: Shield, title: "Risk Management", description: "Built-in stop-loss, take-profit, trailing stops, and negative balance protection to safeguard your capital." },
  { icon: Clock, title: "24/7 Trading", description: "Trade crypto markets around the clock and forex markets 24/5. Never miss a market opportunity." },
  { icon: TrendingUp, title: "Leverage Up to 1:500", description: "Access flexible leverage options tailored to your experience level and risk appetite across all asset classes." },
  { icon: Layers, title: "Multi-Asset Platform", description: "Trade forex, crypto, stocks, indices, commodities, and ETFs from a single unified account." },
];

const accountTypes = [
  { name: "Standard", minDeposit: "$250", spread: "From 1.2 pips", leverage: "Up to 1:200", commission: "None", features: ["All instruments", "Basic charting", "Email support"] },
  { name: "Professional", minDeposit: "$5,000", spread: "From 0.6 pips", leverage: "Up to 1:400", commission: "$3.50/lot", features: ["Priority execution", "Advanced analytics", "Dedicated manager"], popular: true },
  { name: "VIP", minDeposit: "$25,000", spread: "From 0.0 pips", leverage: "Up to 1:500", commission: "$2.00/lot", features: ["Institutional spreads", "API access", "Private events"] },
];

const Trading = () => (
  <StaticPageLayout>
    <SEO title="Trading Platform" description="Trade forex, crypto, stocks, and commodities with ultra-fast execution, advanced charting, and up to 1:500 leverage on Vertex Global Markets." path="/trading" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Powerful <span className="text-gradient-brand">Trading</span> Platform
          </h1>
          <p className="text-lg text-muted-foreground">
            Execute trades with institutional-grade speed, precision, and reliability. Built for traders who demand the best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((f) => (
            <Card key={f.title} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <f.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Account Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {accountTypes.map((acc) => (
            <Card key={acc.name} className={`bg-card border-border relative ${acc.popular ? "border-primary ring-1 ring-primary/30" : ""}`}>
              {acc.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
              )}
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-display font-bold text-foreground mb-1">{acc.name}</h3>
                <p className="text-3xl font-display font-bold text-gradient-brand my-4">{acc.minDeposit}</p>
                <p className="text-xs text-muted-foreground mb-4">Minimum Deposit</p>
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <p>Spread: <span className="text-foreground">{acc.spread}</span></p>
                  <p>Leverage: <span className="text-foreground">{acc.leverage}</span></p>
                  <p>Commission: <span className="text-foreground">{acc.commission}</span></p>
                </div>
                <ul className="space-y-2 mb-6">
                  {acc.features.map((feat) => (
                    <li key={feat} className="text-xs text-muted-foreground">✓ {feat}</li>
                  ))}
                </ul>
                <Button className={`w-full ${acc.popular ? "bg-gradient-brand text-primary-foreground font-semibold" : ""}`} variant={acc.popular ? "default" : "outline"} asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Trading;
