import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const assetClasses = [
  { name: "Forex", pairs: "50+ pairs", desc: "Trade major, minor, and exotic currency pairs with tight spreads.", icon: "💱", button: "Start Trading Forex", link: "/markets/forex" },
  { name: "Crypto", pairs: "200+ coins", desc: "Access Bitcoin, Ethereum, and hundreds of altcoins 24/7.", icon: "₿", button: "Trade Crypto", link: "/markets/crypto" },
  { name: "Stocks", pairs: "5,000+ equities", desc: "Invest in global equities from NYSE, NASDAQ, LSE, and more.", icon: "📈", button: "Explore Stocks", link: "/markets/stocks" },
  { name: "Commodities", pairs: "30+ assets", desc: "Trade gold, silver, oil, natural gas, and agricultural products.", icon: "🏆", button: "Trade Commodities", link: "/markets/commodities" },
  { name: "Indices", pairs: "20+ indices", desc: "Gain exposure to S&P 500, FTSE, DAX, Nikkei, and more.", icon: "📊", button: "Trade Indices", link: "/markets/indices" },
  { name: "Real Estate", pairs: "140+ properties", desc: "Invest in global real estate through REITs, tokenized assets, and development projects.", icon: "🏢", button: "Explore Real Estate", link: "/markets/real-estate" },
  { name: "ETFs & Funds", pairs: "500+ funds", desc: "Diversify with ETFs, venture funds, and managed portfolios.", icon: "🏦", button: "View Funds", link: "/markets/etfs" },
];

const MarketsOverview = () => {
  return (
    <section className="py-24 relative bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Access <span className="text-gradient-brand">Every Market</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Diversify across asset classes and global markets — all from a single, unified platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {assetClasses.map((asset, i) => (
            <motion.div
              key={asset.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={asset.link}
                className="block p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-glow transition-all duration-300 group h-full"
              >
                <div className="text-4xl mb-3">{asset.icon}</div>
                <h3 className="font-display font-bold text-xl mb-1 text-foreground group-hover:text-primary transition-colors">{asset.name}</h3>
                <p className="text-sm text-primary font-semibold mb-2">{asset.pairs}</p>
                <p className="text-sm text-muted-foreground mb-4">{asset.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  {asset.button} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/markets">
              View All Markets <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MarketsOverview;
