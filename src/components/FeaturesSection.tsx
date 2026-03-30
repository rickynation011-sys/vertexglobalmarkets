import { motion } from "framer-motion";
import { Bot, LineChart, Copy, PieChart, Shield, Wallet, Cpu, Target } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Assisted Analysis",
    description: "Data-driven algorithms analyze markets to identify potential trading opportunities.",
  },
  {
    icon: LineChart,
    title: "Multi-Asset Trading",
    description: "Trade forex, crypto, stocks, commodities, indices, ETFs, futures, and bonds from one account.",
  },
  {
    icon: Copy,
    title: "Copy Trading",
    description: "Follow the strategies of experienced traders. Diversify across different approaches.",
  },
  {
    icon: PieChart,
    title: "Portfolio Management",
    description: "Tools for diversification and rebalancing to help manage your investment portfolio.",
  },
  {
    icon: Target,
    title: "Trading Signals",
    description: "Data-driven signals with entry, exit, and stop-loss recommendations.",
  },
  {
    icon: Cpu,
    title: "Algo Strategies",
    description: "Deploy algorithmic strategies or choose from available systems on the platform.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Advanced risk tools with stop-loss, position sizing, and drawdown protection.",
  },
  {
    icon: Wallet,
    title: "Flexible Deposits",
    description: "Fund your account using crypto, bank transfer, or supported payment methods.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Tools for <span className="text-gradient-brand">Informed Trading</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Access tools to trade and invest across global financial markets. Results depend on market conditions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-glow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
