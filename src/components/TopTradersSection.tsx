import { motion } from "framer-motion";
import { BarChart3, Shield } from "lucide-react";

const TopTradersSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Trading <span className="text-gradient-brand">Community</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore sample performance insights from our trading community. Individual results vary based on market conditions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: "Conservative Strategies", desc: "Lower risk approaches focused on capital preservation and steady participation in markets.", icon: Shield },
            { title: "Balanced Approaches", desc: "Moderate risk strategies that aim for a balance between growth potential and risk management.", icon: BarChart3 },
            { title: "Active Trading", desc: "Higher engagement strategies for experienced traders who actively monitor market movements.", icon: BarChart3 },
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
          Performance varies based on market conditions. Past results do not guarantee future outcomes.
        </p>
      </div>
    </section>
  );
};

export default TopTradersSection;
