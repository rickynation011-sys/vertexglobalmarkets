import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import traderDaniel from "@/assets/profiles/trader-daniel.jpg";
import traderSophia from "@/assets/profiles/trader-sophia.jpg";
import traderEthan from "@/assets/profiles/trader-ethan.jpg";
import traderMichael from "@/assets/profiles/trader-michael.jpg";
import traderLucas from "@/assets/profiles/trader-lucas.jpg";
import traderRyan from "@/assets/profiles/trader-ryan.jpg";
import traderJames from "@/assets/profiles/trader-james.jpg";
import traderBenjamin from "@/assets/profiles/trader-benjamin.jpg";
import traderOliver from "@/assets/profiles/trader-oliver.jpg";
import traderNathan from "@/assets/profiles/trader-nathan.jpg";

const traders = [
  { name: "Daniel Morgan", country: "USA", flag: "🇺🇸", winRate: 92, profit: "$1.2M", photo: traderDaniel },
  { name: "Sophia Blake", country: "UK", flag: "🇬🇧", winRate: 89, profit: "$980K", photo: traderSophia },
  { name: "Ethan Walker", country: "Canada", flag: "🇨🇦", winRate: 91, profit: "$1.1M", photo: traderEthan },
  { name: "Michael Carter", country: "Australia", flag: "🇦🇺", winRate: 94, profit: "$1.5M", photo: traderMichael },
  { name: "Lucas Bennett", country: "Switzerland", flag: "🇨🇭", winRate: 90, profit: "$870K", photo: traderLucas },
  { name: "Ryan Cooper", country: "USA", flag: "🇺🇸", winRate: 88, profit: "$760K", photo: traderRyan },
  { name: "James Scott", country: "UK", flag: "🇬🇧", winRate: 87, profit: "$690K", photo: traderJames },
  { name: "Benjamin Wright", country: "Germany", flag: "🇩🇪", winRate: 91, profit: "$1.0M", photo: traderBenjamin },
  { name: "Oliver Grant", country: "Netherlands", flag: "🇳🇱", winRate: 89, profit: "$840K", photo: traderOliver },
  { name: "Nathan Brooks", country: "Canada", flag: "🇨🇦", winRate: 90, profit: "$920K", photo: traderNathan },
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
        {traders.map((t, i) => (
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
            <img
              src={t.photo}
              alt={t.name}
              loading="lazy"
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary/20 mb-3"
            />
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
        ))}
      </div>
    </div>
  </section>
);

export default TopTradersSection;
