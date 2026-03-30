import { motion } from "framer-motion";
import { BarChart3, LineChart, Users, Trophy, Copy, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: BarChart3, title: "Crypto Price Ticker", desc: "Real-time price feeds for major cryptocurrencies and tokens.", href: "/features/crypto-ticker" },
  { icon: LineChart, title: "Live Market Charts", desc: "Professional-grade charting with multiple timeframes and indicators.", href: "/features/live-charts" },
  { icon: Users, title: "Referral Program", desc: "Earn bonuses by inviting friends to join the platform.", href: "/features/referral-program" },
  { icon: Trophy, title: "Leaderboards", desc: "Compete with top traders and track your performance ranking.", href: "/features/leaderboards" },
  { icon: Copy, title: "Copy Trading", desc: "Automatically replicate strategies of successful traders.", href: "/features/copy-trading" },
  { icon: Calculator, title: "Investment Calculator", desc: "Plan your investments with our returns forecasting tool.", href: "/features/investment-calculator" },
];

const PlatformFeaturesSection = () => (
  <section className="py-24 relative">
    <div className="container mx-auto px-4">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Platform <span className="text-gradient-brand">Features</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you need to trade, invest, and grow your wealth in one platform.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={f.href}
              className="group block p-6 md:p-8 rounded-2xl bg-card border border-border
                         hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)]
                         transition-all duration-300 hover:scale-[1.02] h-full"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                              group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-sm md:text-base mb-2">{f.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <span className="inline-block mt-3 text-xs text-primary font-medium group-hover:underline">Learn more →</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PlatformFeaturesSection;
