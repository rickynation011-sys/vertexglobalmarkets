import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchInvestors, type LandingInvestor } from "@/lib/landing-api";
import invAlexander from "@/assets/profiles/inv-alexander.jpg";
import invVictoria from "@/assets/profiles/inv-victoria.jpg";
import invSebastian from "@/assets/profiles/inv-sebastian.jpg";
import invIsabella from "@/assets/profiles/inv-isabella.jpg";
import invWilliam from "@/assets/profiles/inv-william.jpg";
import invCharlotte from "@/assets/profiles/inv-charlotte.jpg";
import invHenrik from "@/assets/profiles/inv-henrik.jpg";
import invEmma from "@/assets/profiles/inv-emma.jpg";
import invDavid from "@/assets/profiles/inv-david.jpg";
import invOlivia from "@/assets/profiles/inv-olivia.jpg";
import invMarcus from "@/assets/profiles/inv-marcus.jpg";
import invSophie from "@/assets/profiles/inv-sophie.jpg";
import invThomas from "@/assets/profiles/inv-thomas.jpg";
import invRachel from "@/assets/profiles/inv-rachel.jpg";
import invLiam from "@/assets/profiles/inv-liam.jpg";

const fallbackInvestors = [
  { name: "Alexander Hughes", country: "🇺🇸 USA", portfolio_value: "$12.5M", monthly_profit: "$1.8M", photo_url: invAlexander },
  { name: "Victoria Stone", country: "🇬🇧 UK", portfolio_value: "$10.2M", monthly_profit: "$1.5M", photo_url: invVictoria },
  { name: "Sebastian Müller", country: "🇩🇪 Germany", portfolio_value: "$9.8M", monthly_profit: "$1.4M", photo_url: invSebastian },
  { name: "Isabella Romano", country: "🇮🇹 Italy", portfolio_value: "$8.7M", monthly_profit: "$1.2M", photo_url: invIsabella },
  { name: "William Chen", country: "🇸🇬 Singapore", portfolio_value: "$8.1M", monthly_profit: "$1.1M", photo_url: invWilliam },
  { name: "Charlotte Dubois", country: "🇫🇷 France", portfolio_value: "$7.6M", monthly_profit: "$980K", photo_url: invCharlotte },
  { name: "Henrik Larsson", country: "🇸🇪 Sweden", portfolio_value: "$7.2M", monthly_profit: "$920K", photo_url: invHenrik },
  { name: "Emma Thompson", country: "🇦🇺 Australia", portfolio_value: "$6.9M", monthly_profit: "$870K", photo_url: invEmma },
  { name: "David Kim", country: "🇰🇷 South Korea", portfolio_value: "$6.5M", monthly_profit: "$840K", photo_url: invDavid },
  { name: "Olivia van der Berg", country: "🇳🇱 Netherlands", portfolio_value: "$6.1M", monthly_profit: "$790K", photo_url: invOlivia },
  { name: "Marcus Silva", country: "🇧🇷 Brazil", portfolio_value: "$5.8M", monthly_profit: "$750K", photo_url: invMarcus },
  { name: "Sophie Andersen", country: "🇩🇰 Denmark", portfolio_value: "$5.4M", monthly_profit: "$710K", photo_url: invSophie },
  { name: "Thomas Weber", country: "🇨🇭 Switzerland", portfolio_value: "$5.1M", monthly_profit: "$680K", photo_url: invThomas },
  { name: "Rachel Nakamura", country: "🇯🇵 Japan", portfolio_value: "$4.8M", monthly_profit: "$640K", photo_url: invRachel },
  { name: "Liam O'Brien", country: "🇮🇪 Ireland", portfolio_value: "$4.5M", monthly_profit: "$600K", photo_url: invLiam },
];

const rankColors: Record<number, string> = { 1: "text-yellow-400", 2: "text-gray-300", 3: "text-amber-600" };

const InvestorsLeaderboard = () => {
  const { data: dbInvestors } = useQuery({ queryKey: ["landing-investors"], queryFn: fetchInvestors, staleTime: 60000 });
  const investors = dbInvestors && dbInvestors.length > 0 ? dbInvestors : fallbackInvestors;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Top Investors <span className="text-gradient-brand">Leaderboard</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Our highest-performing investors ranked by portfolio value and monthly returns.</p>
        </motion.div>
        <motion.div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
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
                const initials = inv.name.split(" ").map((w) => w[0]).join("");
                return (
                  <tr key={inv.name + i} className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20">
                    <td className="px-4 md:px-6 py-4">
                      <span className={`font-bold text-base ${rankColors[rank] || "text-muted-foreground"}`}>
                        {isTop3 && <Trophy className="inline h-4 w-4 mr-1 -mt-0.5" />}#{rank}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        {inv.photo_url ? (
                          <img src={inv.photo_url} alt={inv.name} loading="lazy" width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-primary/20" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">{initials}</div>
                        )}
                        <span className="font-medium text-foreground">{inv.name}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-muted-foreground hidden sm:table-cell">{inv.country}</td>
                    <td className="px-4 md:px-6 py-4 text-right font-semibold text-foreground">{inv.portfolio_value}</td>
                    <td className="px-4 md:px-6 py-4 text-right font-semibold text-success hidden md:table-cell">{inv.monthly_profit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestorsLeaderboard;
