import { motion } from "framer-motion";
import { Cpu, TrendingUp, BarChart3, ShieldCheck } from "lucide-react";

const AutoTradingSection = () => {
  return (
    <section className="py-24 relative bg-card/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              AI-Assisted <span className="text-gradient-brand">Market Analysis</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Our system uses data-driven algorithms to analyze market conditions and identify potential trading opportunities across multiple asset classes. Results are not guaranteed and depend on market conditions.
            </p>
            <div className="space-y-4">
              {[
                { icon: Cpu, text: "Data-driven models analyzing historical and real-time market data" },
                { icon: TrendingUp, text: "Market analysis across forex, crypto, and equities" },
                { icon: BarChart3, text: "Portfolio tools with automated rebalancing options" },
                { icon: ShieldCheck, text: "Built-in risk management with stop-loss and position controls" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              No guarantee of profits. All trading involves risk and past performance does not indicate future results.
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-foreground">Trading Strategies</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Conservative", desc: "Lower risk, capital preservation focus", risk: "Low" },
                  { label: "Balanced", desc: "Moderate risk-reward approach", risk: "Medium" },
                  { label: "Active", desc: "Higher engagement, experienced traders", risk: "High" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="font-display font-medium text-sm text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      s.risk === "Low" ? "bg-success/10 text-success" :
                      s.risk === "Medium" ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>{s.risk} Risk</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">Performance varies based on market conditions.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AutoTradingSection;
