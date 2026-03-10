import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3, Globe, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const marketCategories = [
  {
    title: "Forex",
    description: "Trade 60+ currency pairs with tight spreads and up to 1:500 leverage.",
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF", "NZD/USD"],
    icon: Globe,
  },
  {
    title: "Cryptocurrencies",
    description: "Access 50+ digital assets including Bitcoin, Ethereum, and emerging altcoins.",
    pairs: ["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD", "ADA/USD", "DOGE/USD"],
    icon: Zap,
  },
  {
    title: "Commodities",
    description: "Trade gold, silver, oil, and agricultural commodities with competitive margins.",
    pairs: ["XAU/USD", "XAG/USD", "WTI Oil", "Brent Oil", "Natural Gas", "Copper"],
    icon: BarChart3,
  },
  {
    title: "Indices",
    description: "Gain exposure to global stock markets through major index CFDs.",
    pairs: ["S&P 500", "NASDAQ 100", "FTSE 100", "DAX 40", "Nikkei 225", "Hang Seng"],
    icon: TrendingUp,
  },
  {
    title: "Stocks",
    description: "Trade fractional shares of top companies from NYSE, NASDAQ, and global exchanges.",
    pairs: ["Apple", "Tesla", "Amazon", "Google", "Microsoft", "NVIDIA"],
    icon: TrendingDown,
  },
  {
    title: "ETFs",
    description: "Diversify with exchange-traded funds covering sectors, regions, and strategies.",
    pairs: ["SPY", "QQQ", "VTI", "ARKK", "GLD", "EEM"],
    icon: Shield,
  },
];

const Markets = () => (
  <StaticPageLayout>
    <SEO title="Global Markets" description="Access thousands of instruments across forex, crypto, commodities, indices, stocks, and ETFs on Vertex Global Markets." path="/markets" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Global <span className="text-gradient-brand">Markets</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Access thousands of instruments across forex, crypto, commodities, indices, stocks, and ETFs — all from one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketCategories.map((cat) => (
            <Card key={cat.title} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground">{cat.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.pairs.map((pair) => (
                    <span key={pair} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">{pair}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Start Trading Now</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Markets;
