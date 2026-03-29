import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchTraders, type LandingTrader } from "@/lib/landing-api";
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

const fallbackTraders = [
  { name: "Daniel Morgan", country: "USA", flag: "🇺🇸", win_rate: 92, total_profit: "$1.2M", photo_url: traderDaniel },
  { name: "Sophia Blake", country: "UK", flag: "🇬🇧", win_rate: 89, total_profit: "$980K", photo_url: traderSophia },
  { name: "Ethan Walker", country: "Canada", flag: "🇨🇦", win_rate: 91, total_profit: "$1.1M", photo_url: traderEthan },
  { name: "Michael Carter", country: "Australia", flag: "🇦🇺", win_rate: 94, total_profit: "$1.5M", photo_url: traderMichael },
  { name: "Lucas Bennett", country: "Switzerland", flag: "🇨🇭", win_rate: 90, total_profit: "$870K", photo_url: traderLucas },
  { name: "Ryan Cooper", country: "USA", flag: "🇺🇸", win_rate: 88, total_profit: "$760K", photo_url: traderRyan },
  { name: "James Scott", country: "UK", flag: "🇬🇧", win_rate: 87, total_profit: "$690K", photo_url: traderJames },
  { name: "Benjamin Wright", country: "Germany", flag: "🇩🇪", win_rate: 91, total_profit: "$1.0M", photo_url: traderBenjamin },
  { name: "Oliver Grant", country: "Netherlands", flag: "🇳🇱", win_rate: 89, total_profit: "$840K", photo_url: traderOliver },
  { name: "Nathan Brooks", country: "Canada", flag: "🇨🇦", win_rate: 90, total_profit: "$920K", photo_url: traderNathan },
];

const TopTradersSection = () => {
  const { data: dbTraders } = useQuery({ queryKey: ["landing-traders"], queryFn: fetchTraders, staleTime: 60000 });
  const traders = dbTraders && dbTraders.length > 0 ? dbTraders : fallbackTraders;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Top <span className="text-gradient-brand">Day Traders</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Meet our highest-performing traders delivering consistent results across global markets.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {traders.map((t, i) => {
            const initials = t.name.split(" ").map((w) => w[0]).join("");
            return (
              <motion.div key={t.name + i} className="group flex flex-col items-center p-5 md:p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)] transition-all duration-300 hover:scale-[1.03]" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.name} loading="lazy" width={80} height={80} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary/20 mb-3" />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-xl md:text-2xl font-bold text-primary mb-3">{initials}</div>
                )}
                <h3 className="font-display font-semibold text-foreground text-sm md:text-base text-center">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.flag} {t.country}</p>
                <div className="mt-3 flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-success" /><span className="text-success font-bold text-lg">{t.win_rate}%</span></div>
                <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
                <p className="text-xs font-medium text-foreground/70 mt-2">{t.total_profit} Profit</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TopTradersSection;
