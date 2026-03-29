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

  const tick = useCallback(() => {
    if (activeInvestments.length === 0) return;

    const inv =
      activeInvestments[Math.floor(Math.random() * activeInvestments.length)];

    const baseIncrement =
      (Number(inv.amount) * (Number(inv.daily_rate) / 100)) / 200;

    const fluctuation = 0.7 + Math.random() * 1.1;
    const increment = Math.max(0.01, baseIncrement * fluctuation);
    const roundedIncrement = Math.round(increment * 100) / 100;

    setBonusMap((prev) => ({
      ...prev,
      [inv.id]: (prev[inv.id] || 0) + roundedIncrement,
    }));

    setWalletBonus((prev) => {
      const newBonus = prev + roundedIncrement;
      // Check milestones
      for (const m of MILESTONES) {
        if (newBonus >= m && !passedMilestones.current.has(m)) {
          passedMilestones.current.add(m);
          setMilestone(m);
        }
      }
      return newBonus;
    });

    setLastFlash({ type: "profit", amount: roundedIncrement, ts: Date.now() });

    // Track balance history for sparkline (keep last 30 points)
    setBalanceHistory((prev) => {
      const newVal = walletBalance + walletBonus + roundedIncrement;
      return [...prev.slice(-29), newVal];
    });

    if (Math.random() < 0.4) {
      const labels = [
        `Daily Profit — ${inv.plan_name}`,
        `Trade Profit — ${inv.plan_name}`,
        `Yield — ${inv.plan_name}`,
        `Auto-Trade Gain`,
        `ROI Credit`,
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
      const delay = 5000 + Math.random() * 3000;
      return setTimeout(() => {
        tick();
        tickRef.current = scheduleNext() as unknown as number;
      }, delay);
    };

    const initialDelay = 2000 + Math.random() * 2000;
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
