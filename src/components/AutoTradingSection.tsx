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
              AI-Powered <span className="text-gradient-brand">Automated Trading</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Our advanced algorithms analyze market conditions 24/7, executing optimized trades across multiple asset classes.
              Estimated monthly returns of 4–12% depending on market conditions.*
            </p>
            <div className="space-y-4">
              {[
                { icon: Cpu, text: "Machine learning models trained on 10+ years of market data" },
                { icon: TrendingUp, text: "Real-time market analysis across forex, crypto, and equities" },
                { icon: BarChart3, text: "Automated portfolio rebalancing and risk management" },
                { icon: ShieldCheck, text: "Built-in stop-loss, drawdown protection, and position sizing" },
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
              *Returns are estimates, not guarantees. Past performance does not guarantee future results.
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
                <h3 className="font-display font-semibold text-foreground">AI Performance</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">Live</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Conservative Strategy", return: "+4.2%", risk: "Low" },
                  { label: "Balanced Growth", return: "+7.8%", risk: "Medium" },
                  { label: "Aggressive Alpha", return: "+11.4%", risk: "High" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="font-display font-medium text-sm text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">Risk: {s.risk}</p>
                    </div>
                    <span className="font-display font-bold text-lg text-success">{s.return}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">Estimated monthly returns. Not guaranteed.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AutoTradingSection;
