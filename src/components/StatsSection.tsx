import { motion } from "framer-motion";
import { Users, BarChart3, Globe, DollarSign } from "lucide-react";

const stats = [
  { icon: Users, value: "2.4M+", label: "Active Investors", color: "text-primary" },
  { icon: BarChart3, value: "$18.7B", label: "Trading Volume (24h)", color: "text-accent" },
  { icon: Globe, value: "180+", label: "Countries Supported", color: "text-secondary" },
  { icon: DollarSign, value: "99.98%", label: "Platform Uptime", color: "text-success" },
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
              <p className="font-display text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
