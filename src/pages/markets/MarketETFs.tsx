import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, PieChart } from "lucide-react";
import MarketChart from "@/components/MarketChart";
import Sparkline from "@/components/Sparkline";

const funds = [
  { name: "SPDR S&P 500", symbol: "SPY", price: "$528.45", change: "+0.72%", aum: "$520B", category: "Index ETF", up: true },
  { name: "Invesco QQQ", symbol: "QQQ", price: "$445.12", change: "+1.15%", aum: "$250B", category: "Tech ETF", up: true },
  { name: "Vanguard Total Stock", symbol: "VTI", price: "$265.80", change: "+0.45%", aum: "$380B", category: "Index ETF", up: true },
  { name: "ARK Innovation", symbol: "ARKK", price: "$52.35", change: "-1.82%", aum: "$8B", category: "Growth ETF", up: false },
  { name: "SPDR Gold Shares", symbol: "GLD", price: "$218.90", change: "+0.65%", aum: "$58B", category: "Commodity ETF", up: true },
  { name: "iShares MSCI EM", symbol: "EEM", price: "$42.15", change: "-0.32%", aum: "$20B", category: "Emerging Markets", up: false },
  { name: "Vanguard Real Estate", symbol: "VNQ", price: "$88.45", change: "+0.28%", aum: "$35B", category: "REIT ETF", up: true },
  { name: "iShares Bond ETF", symbol: "AGG", price: "$98.72", change: "+0.12%", aum: "$90B", category: "Bond ETF", up: true },
  { name: "Vertex Growth Fund", symbol: "VGF", price: "$145.20", change: "+2.45%", aum: "$2.5B", category: "Managed Fund", up: true },
  { name: "Vertex Venture Capital", symbol: "VVC", price: "$85.60", change: "+1.85%", aum: "$800M", category: "Venture Fund", up: true },
];

const MarketETFs = () => (
  <StaticPageLayout>
    <SEO title="ETFs & Funds | Vertex Global Markets" description="Diversify with 500+ ETFs, venture funds, and managed portfolios." path="/markets/etfs" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-5xl mb-4">🏦</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            ETFs & <span className="text-gradient-brand">Funds</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Diversify with 500+ ETFs, venture funds, and professionally managed portfolios.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Funds Available", value: "500+" },
            { label: "Categories", value: "12" },
            { label: "Min Investment", value: "$50" },
            { label: "Avg Return", value: "8-15%" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
              <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-12">
          {funds.map((f) => (
            <div key={f.symbol} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                {f.up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                <div>
                  <span className="font-display font-semibold text-foreground">{f.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{f.symbol}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-6 text-sm">
                <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground hidden md:block">{f.category}</span>
                <span className="font-mono text-foreground">{f.price}</span>
                <span className={`font-medium ${f.up ? "text-primary" : "text-destructive"}`}>{f.change}</span>
                <span className="text-muted-foreground hidden lg:block">{f.aum}</span>
                <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
                  <Link to="/register">Invest</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Managed Portfolios CTA */}
        <Card className="bg-card border-border mb-12">
          <CardContent className="p-8 text-center">
            <PieChart className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Managed Portfolios</h3>
            <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
              Let our AI-powered portfolio management system build and rebalance a diversified portfolio for you.
            </p>
            <Button className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mb-12">
          <MarketChart
            title="SPDR S&P 500 ETF (SPY)"
            basePrice={528.45}
            symbol="SPY · Index ETF"
          />
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Start Investing in Funds</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default MarketETFs;
