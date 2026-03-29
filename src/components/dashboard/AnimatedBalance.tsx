import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedBalanceProps {
  value: number;
  format: (n: number) => string;
  flash?: { amount: number; ts: number } | null;
  className?: string;
}

const AnimatedBalance = ({ value, format, flash, className = "" }: AnimatedBalanceProps) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (Math.abs(end - start) < 0.01) {
      setDisplay(end);
      prevRef.current = end;
      return;
    }

    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      <span>{format(display)}</span>
      <AnimatePresence>
        {flash && (
          <motion.span
            key={flash.ts}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute -right-14 top-0 text-xs font-semibold text-success whitespace-nowrap pointer-events-none"
          >
            +{format(flash.amount)}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default AnimatedBalance;
