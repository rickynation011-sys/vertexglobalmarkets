import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MilestoneConfettiProps {
  milestone: number | null;
  format: (n: number) => string;
}

const CONFETTI_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#F9A825",
  "#AB47BC",
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  dx: number;
  dy: number;
  delay: number;
};

const MilestoneConfetti = ({ milestone, format }: MilestoneConfettiProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!milestone) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: randomBetween(10, 90),
      y: randomBetween(-10, 30),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: randomBetween(4, 10),
      rotation: randomBetween(0, 360),
      dx: randomBetween(-30, 30),
      dy: randomBetween(60, 120),
      delay: randomBetween(0, 0.3),
    }));
    setParticles(newParticles);
  }, [milestone]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
        >
          {/* Confetti particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                rotate: p.rotation,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                left: `${p.x + p.dx}%`,
                top: `${p.y + p.dy}%`,
                rotate: p.rotation + randomBetween(180, 720),
                opacity: 0,
                scale: 0.5,
              }}
              transition={{
                duration: 2.5,
                delay: p.delay,
                ease: "easeOut",
              }}
              className="absolute"
              style={{
                width: p.size,
                height: p.size * randomBetween(1, 2.5),
                backgroundColor: p.color,
                borderRadius: randomBetween(0, 1) > 0.5 ? "50%" : "2px",
              }}
            />
          ))}

          {/* Milestone badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
            className="bg-card/95 backdrop-blur-xl border-2 border-primary/50 rounded-2xl px-8 py-6 shadow-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-4xl mb-2"
            >
              🎉
            </motion.div>
            <p className="text-sm text-muted-foreground font-medium">Milestone Reached!</p>
            <p className="text-2xl font-display font-bold text-success mt-1">
              +{format(milestone)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Simulated Profit</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MilestoneConfetti;
