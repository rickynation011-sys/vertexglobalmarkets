import { useState, useEffect, useRef, useCallback } from "react";

export type SimulatedProfit = {
  id: string;
  label: string;
  amount: number;
  timestamp: number;
};

type Investment = {
  id: string;
  plan_name: string;
  amount: number;
  current_value: number;
  daily_rate: number;
  status: string;
  started_at: string;
  ends_at: string;
};

const MILESTONES = [100, 500, 1000, 2500, 5000, 10000];

/**
 * Simulates gradual profit growth for active investments.
 * Tracks balance history for sparkline and milestone confetti triggers.
 */
export function useProfitSimulation(
  investments: Investment[] | undefined,
  walletBalance: number
) {
  const activeInvestments = (investments ?? []).filter(
    (i) => i.status === "active"
  );

  const [bonusMap, setBonusMap] = useState<Record<string, number>>({});
  const [walletBonus, setWalletBonus] = useState(0);
  const [recentProfits, setRecentProfits] = useState<SimulatedProfit[]>([]);
  const [lastFlash, setLastFlash] = useState<{
    type: "balance" | "profit";
    amount: number;
    ts: number;
  } | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<number[]>([]);
  const [milestone, setMilestone] = useState<number | null>(null);
  const tickRef = useRef(0);
  const passedMilestones = useRef<Set<number>>(new Set());

  const lastTickInv = useRef<string | null>(null);

  const tick = useCallback(() => {
    if (activeInvestments.length === 0) return;

    // Avoid ticking the same investment twice in a row when multiple exist
    let inv: Investment;
    if (activeInvestments.length > 1 && lastTickInv.current) {
      const others = activeInvestments.filter(i => i.id !== lastTickInv.current);
      inv = others[Math.floor(Math.random() * others.length)];
    } else {
      inv = activeInvestments[Math.floor(Math.random() * activeInvestments.length)];
    }
    lastTickInv.current = inv.id;

    const baseIncrement =
      (Number(inv.amount) * (Number(inv.daily_rate) / 100)) / 200;

    // Log-normal-ish fluctuation for natural variation
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(Math.max(u1, 0.001))) * Math.cos(2 * Math.PI * u2);
    const fluctuation = Math.exp(z * 0.3); // centered around 1, spread ~0.3
    const clampedFluctuation = Math.max(0.3, Math.min(2.5, fluctuation));
    const increment = Math.max(0.01, baseIncrement * clampedFluctuation);
    const roundedIncrement = Math.round(increment * 100) / 100;

    setBonusMap((prev) => ({
      ...prev,
      [inv.id]: (prev[inv.id] || 0) + roundedIncrement,
    }));

    setWalletBonus((prev) => {
      const newBonus = prev + roundedIncrement;
      for (const m of MILESTONES) {
        if (newBonus >= m && !passedMilestones.current.has(m)) {
          passedMilestones.current.add(m);
          setMilestone(m);
        }
      }
      return newBonus;
    });

    setLastFlash({ type: "profit", amount: roundedIncrement, ts: Date.now() });

    setBalanceHistory((prev) => {
      const newVal = walletBalance + walletBonus + roundedIncrement;
      return [...prev.slice(-29), newVal];
    });

    // Vary the chance of logging an activity entry (30-50%)
    if (Math.random() < 0.3 + Math.random() * 0.2) {
      const labels = [
        `Daily Profit — ${inv.plan_name}`,
        `Trade Profit — ${inv.plan_name}`,
        `Yield — ${inv.plan_name}`,
        `Auto-Trade Gain`,
        `ROI Credit`,
        `Compound Return`,
        `Market Gain — ${inv.plan_name}`,
      ];
      const label = labels[Math.floor(Math.random() * labels.length)];

      setRecentProfits((prev) => [
        {
          id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label,
          amount: roundedIncrement,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 19),
      ]);
    }
  }, [activeInvestments, walletBalance, walletBonus]);

  useEffect(() => {
    if (activeInvestments.length === 0) return;

    const scheduleNext = () => {
      // Variable delay: 4-10s base, occasional longer pauses (15-25s)
      const isSlowTick = Math.random() < 0.08;
      const delay = isSlowTick
        ? 15000 + Math.random() * 10000
        : 4000 + Math.random() * 6000;
      return setTimeout(() => {
        tick();
        tickRef.current = scheduleNext() as unknown as number;
      }, delay);
    };

    const initialDelay = 2500 + Math.random() * 3000;
    const initialTimeout = setTimeout(() => {
      tick();
      tickRef.current = scheduleNext() as unknown as number;
    }, initialDelay);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(tickRef.current);
    };
  }, [activeInvestments.length, tick]);

  // Clear flash after 2s
  useEffect(() => {
    if (!lastFlash) return;
    const t = setTimeout(() => setLastFlash(null), 2000);
    return () => clearTimeout(t);
  }, [lastFlash]);

  // Clear milestone after 4s
  useEffect(() => {
    if (!milestone) return;
    const t = setTimeout(() => setMilestone(null), 4000);
    return () => clearTimeout(t);
  }, [milestone]);

  // Initialize sparkline with current balance
  useEffect(() => {
    if (balanceHistory.length === 0 && walletBalance > 0) {
      setBalanceHistory([walletBalance]);
    }
  }, [walletBalance, balanceHistory.length]);

  const simulatedBalance = walletBalance + walletBonus;

  const getSimulatedCurrentValue = (inv: Investment) =>
    Number(inv.current_value) + (bonusMap[inv.id] || 0);

  const totalSimulatedProfit = Object.values(bonusMap).reduce(
    (s, v) => s + v,
    0
  );

  return {
    simulatedBalance,
    getSimulatedCurrentValue,
    totalSimulatedProfit,
    walletBonus,
    recentProfits,
    lastFlash,
    balanceHistory,
    milestone,
  };
}
