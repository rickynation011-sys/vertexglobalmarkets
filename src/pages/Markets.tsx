import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, ArrowRight, TrendingUp, TrendingDown, BarChart3, Users, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";

const marketCategories = [
  { title: "Forex", count: "50+ pairs", desc: "Trade major, minor, and exotic currency pairs with tight spreads.", icon: "💱", link: "/markets/forex", button: "Start Trading Forex" },
  { title: "Crypto", count: "200+ coins", desc: "Access Bitcoin, Ethereum, and hundreds of altcoins 24/7.", icon: "₿", link: "/markets/crypto", button: "Trade Crypto" },
  { title: "Stocks", count: "5,000+ equities", desc: "Invest in global equities from NYSE, NASDAQ, LSE, and more.", icon: "📈", link: "/markets/stocks", button: "Explore Stocks" },
  { title: "Commodities", count: "30+ assets", desc: "Trade gold, silver, oil, natural gas, and agricultural products.", icon: "🏆", link: "/markets/commodities", button: "Trade Commodities" },
  { title: "Indices", count: "20+ indices", desc: "Gain exposure to S&P 500, FTSE, DAX, Nikkei, and more.", icon: "📊", link: "/markets/indices", button: "Trade Indices" },
  { title: "Real Estate", count: "140+ properties", desc: "Invest in global real estate through REITs, tokenized assets, and development projects.", icon: "🏢", link: "/markets/real-estate", button: "Explore Real Estate" },
  { title: "ETFs & Funds", count: "500+ funds", desc: "Diversify with ETFs, venture funds, and managed portfolios.", icon: "🏦", link: "/markets/etfs", button: "View Funds" },
];

const trendingAssets = [
  { name: "Bitcoin", symbol: "BTC", price: "$67,432", change: "+2.35%", up: true },
  { name: "NVIDIA", symbol: "NVDA", price: "$875.28", change: "+2.15%", up: true },
  { name: "Gold", symbol: "XAU", price: "$2,342", change: "+0.85%", up: true },
  { name: "EUR/USD", symbol: "FX", price: "1.0842", change: "+0.12%", up: true },
  { name: "S&P 500", symbol: "SPX", price: "5,425", change: "+0.65%", up: true },
  { name: "Tesla", symbol: "TSLA", price: "$245.12", change: "+3.85%", up: true },
];

const Markets = () => {
  const [search, setSearch] = useState("");
  const filtered = marketCategories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StaticPageLayout>
      <SEO title="Global Markets | Vertex Global Markets" description="Access thousands of instruments across forex, crypto, commodities, indices, stocks, real estate, and ETFs." path="/markets" />
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Global <span className="text-gradient-brand">Markets</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Access thousands of instruments across forex, crypto, commodities, indices, stocks, real estate, and ETFs — all from one platform.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Instruments", value: "5,840+", icon: <BarChart3 className="h-5 w-5 text-primary" /> },
              { label: "Active Traders", value: "180K+", icon: <Users className="h-5 w-5 text-primary" /> },
              { label: "Countries", value: "180+", icon: <Globe className="h-5 w-5 text-primary" /> },
              { label: "Market Categories", value: "7", icon: <TrendingUp className="h-5 w-5 text-primary" /> },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search markets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {/* Trending Assets */}
          <div className="mb-12">
            <h2 className="font-display font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Trending Now
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {trendingAssets.map((a) => (
                <div key={a.symbol} className="p-3 rounded-xl bg-card border border-border text-center hover:border-primary/30 transition-colors">
                  <p className="font-display font-semibold text-foreground text-sm">{a.name}</p>
                  <p className="font-mono text-foreground text-sm">{a.price}</p>
                  <p className={`text-xs font-medium ${a.up ? "text-primary" : "text-destructive"}`}>{a.change}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filtered.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={cat.link}
                  className="block p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-glow transition-all duration-300 group h-full"
                >
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-display font-bold text-xl mb-1 text-foreground group-hover:text-primary transition-colors">{cat.title}</h3>
                  <p className="text-sm text-primary font-semibold mb-2">{cat.count}</p>
                  <p className="text-sm text-muted-foreground mb-4">{cat.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    {cat.button} <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
              <Link to="/register">Start Trading Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default Markets;
