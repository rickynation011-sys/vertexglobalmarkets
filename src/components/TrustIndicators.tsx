import { motion } from "framer-motion";
import { Shield, Users, Globe, Lock } from "lucide-react";

const indicators = [
  { icon: Shield, label: "Secure Platform", subtext: "Enterprise-grade security" },
  { icon: Users, label: "Global Community", subtext: "Users in 180+ countries" },
  { icon: Globe, label: "Multi-Asset Access", subtext: "Forex, crypto, stocks & more" },
  { icon: Lock, label: "Data Protection", subtext: "End-to-end encryption" },
];

const TrustIndicators = () => {
  return (
    <section className="py-8 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {indicators.map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm md:text-base font-display font-bold text-foreground">{item.label}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">{item.subtext}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
