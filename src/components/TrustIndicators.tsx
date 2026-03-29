import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Users, ArrowUpRight, Clock } from "lucide-react";

// Generates a slightly varied value each mount to feel alive
const useJitteredValue = (base: number, jitterPct: number = 0.03) => {
  return useMemo(() => {
    const offset = base * jitterPct * (Math.random() * 2 - 1);
    return base + offset;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

// Animated counter that counts up from 0 with easing
const AnimatedCounter = ({ target, prefix = "", suffix = "", decimals = 0, duration = 2000 }: {
  target: number; prefix?: string; suffix?: string; decimals?: number; duration?: number;
}) => {
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
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const frame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(target * easeOutQuart(progress));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [started, target, duration]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  return <p ref={ref} className="text-lg md:text-xl font-display font-bold text-foreground">{prefix}{formatted}{suffix}</p>;
};

const TrustIndicators = () => {
  const withdrawals = useJitteredValue(84, 2);
  const activeUsers = useJitteredValue(520, 3);
  const uptime = useJitteredValue(99.98, 0.001);
  const secured = useJitteredValue(2.1, 3);

  const stats = useMemo(() => [
    { icon: ArrowUpRight, label: "Withdrawals Processed", target: withdrawals, prefix: "$", suffix: "M+", decimals: 0, subtext: "Paid out to investors", duration: 2200 },
    { icon: Users, label: "Active Users", target: activeUsers, prefix: "", suffix: "K+", decimals: 0, subtext: "Worldwide traders", duration: 1800 },
    { icon: Clock, label: "Platform Uptime", target: uptime, prefix: "", suffix: "%", decimals: 2, subtext: "Last 12 months", duration: 2500 },
    { icon: Shield, label: "Secured Assets", target: secured, prefix: "$", suffix: "B+", decimals: 1, subtext: "Under management", duration: 2000 },
  ], [withdrawals, activeUsers, uptime, secured]);

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
              transition={{ delay: i * 0.1 + Math.random() * 0.1 }}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <AnimatedCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} duration={stat.duration} />
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
