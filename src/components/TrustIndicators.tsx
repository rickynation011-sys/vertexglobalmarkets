import { motion } from "framer-motion";
import { Shield, Users, ArrowUpRight, Clock } from "lucide-react";

const stats = [
  {
    icon: ArrowUpRight,
    label: "Withdrawals Processed",
    value: "$84M+",
    subtext: "Paid out to investors",
  },
  {
    icon: Users,
    label: "Active Users",
    value: "520K+",
    subtext: "Worldwide traders",
  },
  {
    icon: Clock,
    label: "Platform Uptime",
    value: "99.98%",
    subtext: "Last 12 months",
  },
  {
    icon: Shield,
    label: "Secured Assets",
    value: "$2.1B+",
    subtext: "Under management",
  },
];

const TrustIndicators = () => {
  return (
    <section className="py-8 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">{stat.subtext}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
