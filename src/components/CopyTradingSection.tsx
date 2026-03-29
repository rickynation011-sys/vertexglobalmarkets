import { useMemo } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, TrendingUp, Users, Shield, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Trader = {
  name: string;
  avatar: string;
  winRate: number;
  totalProfit: string;
  followers: number;
  monthlyReturn: number;
  riskLevel: "Low" | "Medium" | "High";
  description: string;
};

/** Generate a 6-point sparkline representing 6 months of cumulative P&L */
const generateSparkline = (monthlyReturn: number): number[] => {
  const points: number[] = [0];
  for (let i = 1; i <= 5; i++) {
    const prev = points[i - 1];
    // Each month adds roughly monthlyReturn% with realistic variance
    const gain = monthlyReturn * (0.4 + Math.random() * 1.2);
    // Occasional dip month (20% chance)
    const dip = Math.random() < 0.2 ? -monthlyReturn * 0.6 * Math.random() : 0;
    points.push(prev + gain + dip);
  }
  return points;
};

const MiniSparkline = ({ data }: { data: number[] }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const positive = data[data.length - 1] >= data[0];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${positive ? "up" : "dn"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L${w},${h} L0,${h} Z`}
        fill={`url(#sg-${positive ? "up" : "dn"})`}
      />
      <path
        d={d}
        fill="none"
        stroke={positive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r="2"
        fill={positive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
      />
    </svg>
  );
};

const BASE_TRADERS: Trader[] = [
  { name: "Alex Morgan", avatar: "AM", winRate: 92, totalProfit: "$284K", followers: 1243, monthlyReturn: 8.5, riskLevel: "Low", description: "Conservative forex & crypto strategy" },
  { name: "Sarah Chen", avatar: "SC", winRate: 88, totalProfit: "$512K", followers: 2105, monthlyReturn: 12.3, riskLevel: "Medium", description: "Aggressive momentum trading" },
  { name: "James Wilson", avatar: "JW", winRate: 95, totalProfit: "$178K", followers: 876, monthlyReturn: 5.2, riskLevel: "Low", description: "Steady ETF & index strategies" },
  { name: "Maria Rodriguez", avatar: "MR", winRate: 85, totalProfit: "$723K", followers: 3421, monthlyReturn: 18.7, riskLevel: "High", description: "High-frequency algorithmic trading" },
  { name: "David Kim", avatar: "DK", winRate: 90, totalProfit: "$345K", followers: 1587, monthlyReturn: 9.8, riskLevel: "Medium", description: "AI-driven forex signals" },
  { name: "Emma Thompson", avatar: "ET", winRate: 91, totalProfit: "$267K", followers: 1102, monthlyReturn: 7.4, riskLevel: "Low", description: "Balanced multi-asset portfolio" },
];

const riskColors: Record<string, string> = {
  Low: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  High: "bg-destructive/10 text-destructive",
};

const CopyTradingSection = () => {
  const navigate = useNavigate();

  // Add slight jitter to follower/win rate numbers each render
  const traders = useMemo(() =>
    BASE_TRADERS.map(t => ({
      ...t,
      followers: t.followers + Math.round((Math.random() - 0.5) * 40),
      winRate: t.winRate + (Math.random() > 0.5 ? 1 : -1) * Math.round(Math.random()),
      sparkline: generateSparkline(t.monthlyReturn),
    })), []
  );

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_60%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Copy className="h-4 w-4" />
            Copy Trading
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Copy <span className="text-gradient-brand">Top Traders</span> Automatically
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Follow verified traders and mirror their strategies in real-time. No experience needed — let the pros trade for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {traders.map((trader, i) => (
            <motion.div
              key={trader.name}
              className="group rounded-2xl bg-card border border-border p-5 hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.1)] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {trader.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-card" title="Verified Trader">
                    <BadgeCheck className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground text-sm">{trader.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{trader.description}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${riskColors[trader.riskLevel]}`}>
                  {trader.riskLevel} Risk
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-sm font-bold text-success">{trader.winRate}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Win Rate</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <span className="text-sm font-bold text-foreground">{trader.monthlyReturn}%</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Monthly</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground">{trader.followers.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Followers</p>
                </div>
              </div>

              {/* 6-Month P&L Sparkline */}
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] text-muted-foreground">6-Month P&L</span>
                <MiniSparkline data={trader.sparkline} />
              </div>

              {/* Profit & CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Profit</p>
                  <p className="text-lg font-display font-bold text-success">{trader.totalProfit}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-brand text-primary-foreground text-xs gap-1"
                  onClick={() => navigate("/register")}
                >
                  <Copy className="h-3 w-3" />
                  Copy Trader
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Fund Protection</span>
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-primary" /> Verified Traders</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-success" /> Real-Time Copying</span>
            </div>
          </div>
          <Button
            size="lg"
            className="mt-6 bg-gradient-brand text-primary-foreground font-semibold gap-2"
            onClick={() => navigate("/register")}
          >
            Start Copy Trading <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CopyTradingSection;
