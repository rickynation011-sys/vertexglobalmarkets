import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, Globe, DollarSign } from "lucide-react";

// Animated counter with intersection observer trigger
const AnimatedStat = ({ target, suffix = "", duration = 2000 }: {
  target: string; suffix?: string; duration?: number;
}) => {
  const numericPart = parseFloat(target.replace(/[^0-9.]/g, ""));
  const textPrefix = target.match(/^[^0-9]*/)?.[0] || "";
  const textSuffix = target.match(/[^0-9.]*$/)?.[0] || "";
  const decimals = target.includes(".") ? (target.split(".")[1]?.replace(/[^0-9]/g, "").length || 0) : 0;

  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const frame = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      setValue(numericPart * ease(progress));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [started, numericPart, duration]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  return (
    <p ref={ref} className="font-display text-3xl md:text-4xl font-bold text-foreground">
      {textPrefix}{formatted}{textSuffix}{suffix}
    </p>
  );
};

// Add slight jitter to static values each page load
const useJitteredStats = () => {
  return useMemo(() => {
    const jitter = (base: number, pct: number = 0.03) => {
      const offset = base * pct * (Math.random() * 2 - 1);
      return base + offset;
    };
    return [
      { icon: Users, value: `${jitter(2.4, 0.05).toFixed(1)}M+`, label: "Active Investors", color: "text-primary", duration: 1800 },
      { icon: BarChart3, value: `$${jitter(18.7, 0.08).toFixed(1)}B`, label: "Trading Volume (24h)", color: "text-accent", duration: 2200 },
      { icon: Globe, value: "180+", label: "Countries Supported", color: "text-secondary", duration: 1500 },
      { icon: DollarSign, value: `${jitter(99.98, 0.001).toFixed(2)}%`, label: "Platform Uptime", color: "text-success", duration: 2500 },
    ];
  }, []);
};

const StatsSection = () => {
  const stats = useJitteredStats();

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
              transition={{ delay: i * 0.1 + Math.random() * 0.05 }}
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <AnimatedStat target={stat.value} duration={stat.duration} />
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
