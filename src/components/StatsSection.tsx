import { motion } from "framer-motion";
import { Users, Shield, Globe, BarChart3 } from "lucide-react";

const stats = [
  { icon: Users, label: "Growing Global User Base", desc: "Traders from around the world", color: "text-primary" },
  { icon: BarChart3, label: "Advanced Trading Tools", desc: "Data-driven market analysis", color: "text-accent" },
  { icon: Globe, label: "180+ Countries Supported", desc: "Worldwide platform access", color: "text-secondary" },
  { icon: Shield, label: "Secure Infrastructure", desc: "Reliable and protected systems", color: "text-success" },
];

const StatsSection = () => {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(215_60%_50%/0.05),transparent_70%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-card/50 border border-border shadow-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <p className="font-display text-base md:text-lg font-bold text-foreground">{stat.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
