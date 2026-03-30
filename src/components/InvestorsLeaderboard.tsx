import { motion } from "framer-motion";
import { TrendingUp, Shield, Users } from "lucide-react";

const InvestorsLeaderboard = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Investment <span className="text-gradient-brand">Insights</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sample performance insights. Individual results depend on market conditions and personal strategies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: TrendingUp, title: "Market-Driven Results", desc: "Performance is influenced by global market conditions. Returns are not fixed or guaranteed." },
            { icon: Shield, title: "Risk-Managed Tools", desc: "Our platform provides risk management features including stop-loss and portfolio diversification options." },
            { icon: Users, title: "Global Participation", desc: "Users from over 180 countries participate in trading activities across multiple asset classes." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="p-6 rounded-2xl bg-card border border-border text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Trading involves significant risk. You may lose part or all of your capital.
        </p>
      </div>
    </section>
  );
};

export default InvestorsLeaderboard;
