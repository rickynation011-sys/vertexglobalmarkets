import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const traders = [
  { name: "Daniel Morgan", country: "USA", flag: "🇺🇸", winRate: 92, profit: "$1.2M" },
  { name: "Sophia Blake", country: "UK", flag: "🇬🇧", winRate: 89, profit: "$980K" },
  { name: "Ethan Walker", country: "Canada", flag: "🇨🇦", winRate: 91, profit: "$1.1M" },
  { name: "Michael Carter", country: "Australia", flag: "🇦🇺", winRate: 94, profit: "$1.5M" },
  { name: "Lucas Bennett", country: "Switzerland", flag: "🇨🇭", winRate: 90, profit: "$870K" },
  { name: "Ryan Cooper", country: "USA", flag: "🇺🇸", winRate: 88, profit: "$760K" },
  { name: "James Scott", country: "UK", flag: "🇬🇧", winRate: 87, profit: "$690K" },
  { name: "Benjamin Wright", country: "Germany", flag: "🇩🇪", winRate: 91, profit: "$1.0M" },
  { name: "Oliver Grant", country: "Netherlands", flag: "🇳🇱", winRate: 89, profit: "$840K" },
  { name: "Nathan Brooks", country: "Canada", flag: "🇨🇦", winRate: 90, profit: "$920K" },
];

const TopTradersSection = () => (
  <section className="py-24 relative">
    <div className="container mx-auto px-4">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Top <span className="text-gradient-brand">Day Traders</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Meet our highest-performing traders delivering consistent results across global markets.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {traders.map((t, i) => {
          const initials = t.name.split(" ").map((w) => w[0]).join("");
          return (
            <motion.div
              key={t.name}
              className="group flex flex-col items-center p-5 md:p-6 rounded-2xl bg-card border border-border
                         hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)]
                         transition-all duration-300 hover:scale-[1.03]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 border-2 border-primary/20
                              flex items-center justify-center text-xl md:text-2xl font-bold text-primary mb-3">
                {initials}
              </div>
              <h3 className="font-display font-semibold text-foreground text-sm md:text-base text-center">
                {t.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t.flag} {t.country}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-success font-bold text-lg">{t.winRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
              <p className="text-xs font-medium text-foreground/70 mt-2">{t.profit} Profit</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default TopTradersSection;
