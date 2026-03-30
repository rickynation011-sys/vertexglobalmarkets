import { motion } from "framer-motion";
import { Copy, Shield, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CopyTradingSection = () => {
  const navigate = useNavigate();

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
            Follow <span className="text-gradient-brand">Experienced Traders</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mirror trading strategies from experienced participants on the platform. Results depend on market conditions and individual strategies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Copy, title: "Strategy Mirroring", desc: "Automatically replicate trades from experienced traders you choose to follow." },
            { icon: Shield, title: "Risk Controls", desc: "Set your own limits, stop-loss levels, and allocation amounts for copied strategies." },
            { icon: Users, title: "Community Access", desc: "Browse available traders, review their strategies, and decide who to follow." },
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

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-muted-foreground mb-6">
            Copy trading does not guarantee profits. Past performance of other traders does not predict future results.
          </p>
          <Button
            size="lg"
            className="bg-gradient-brand text-primary-foreground font-semibold gap-2"
            onClick={() => navigate("/register")}
          >
            Explore Copy Trading <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CopyTradingSection;
