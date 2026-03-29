import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const investors = [
  { name: "Alexander Hughes", country: "🇺🇸 USA", portfolio: "$12.5M", profit: "$1.8M" },
  { name: "Victoria Stone", country: "🇬🇧 UK", portfolio: "$10.2M", profit: "$1.5M" },
  { name: "Sebastian Müller", country: "🇩🇪 Germany", portfolio: "$9.8M", profit: "$1.4M" },
  { name: "Isabella Romano", country: "🇮🇹 Italy", portfolio: "$8.7M", profit: "$1.2M" },
  { name: "William Chen", country: "🇸🇬 Singapore", portfolio: "$8.1M", profit: "$1.1M" },
  { name: "Charlotte Dubois", country: "🇫🇷 France", portfolio: "$7.6M", profit: "$980K" },
  { name: "Henrik Larsson", country: "🇸🇪 Sweden", portfolio: "$7.2M", profit: "$920K" },
  { name: "Emma Thompson", country: "🇦🇺 Australia", portfolio: "$6.9M", profit: "$870K" },
  { name: "David Kim", country: "🇰🇷 South Korea", portfolio: "$6.5M", profit: "$840K" },
  { name: "Olivia van der Berg", country: "🇳🇱 Netherlands", portfolio: "$6.1M", profit: "$790K" },
  { name: "Marcus Silva", country: "🇧🇷 Brazil", portfolio: "$5.8M", profit: "$750K" },
  { name: "Sophie Andersen", country: "🇩🇰 Denmark", portfolio: "$5.4M", profit: "$710K" },
  { name: "Thomas Weber", country: "🇨🇭 Switzerland", portfolio: "$5.1M", profit: "$680K" },
  { name: "Rachel Nakamura", country: "🇯🇵 Japan", portfolio: "$4.8M", profit: "$640K" },
  { name: "Liam O'Brien", country: "🇮🇪 Ireland", portfolio: "$4.5M", profit: "$600K" },
];

const rankColors: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

const InvestorsLeaderboard = () => (
  <section className="py-24 relative">
    <div className="container mx-auto px-4">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Top Investors <span className="text-gradient-brand">Leaderboard</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Our highest-performing investors ranked by portfolio value and monthly returns.
        </p>
      </motion.div>

      <motion.div
        className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-muted-foreground">Rank</th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-muted-foreground">Investor</th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-muted-foreground hidden sm:table-cell">Country</th>
              <th className="px-4 md:px-6 py-4 text-right font-semibold text-muted-foreground">Portfolio</th>
              <th className="px-4 md:px-6 py-4 text-right font-semibold text-muted-foreground hidden md:table-cell">Monthly Profit</th>
            </tr>
          </thead>
          <tbody>
            {investors.map((inv, i) => {
              const rank = i + 1;
              const isTop3 = rank <= 3;
              return (
                <tr
                  key={inv.name}
                  className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 md:px-6 py-4">
                    <span className={`font-bold text-base ${rankColors[rank] || "text-muted-foreground"}`}>
                      {isTop3 && <Trophy className="inline h-4 w-4 mr-1 -mt-0.5" />}
                      #{rank}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {inv.name.split(" ").map((w) => w[0]).join("")}
                      </div>
                      <span className="font-medium text-foreground">{inv.name}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-muted-foreground hidden sm:table-cell">{inv.country}</td>
                  <td className="px-4 md:px-6 py-4 text-right font-semibold text-foreground">{inv.portfolio}</td>
                  <td className="px-4 md:px-6 py-4 text-right font-semibold text-success hidden md:table-cell">{inv.profit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  </section>
);

export default InvestorsLeaderboard;
