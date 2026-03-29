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

/**
 * Simulates gradual profit growth for active investments.
 * - Ticks every 5-8s with slight random variation
 * - Generates "Daily Profit" and "Trade Profit" entries
 * - Adds realistic fluctuation (not perfectly linear)
 */
export function useProfitSimulation(
  investments: Investment[] | undefined,
  walletBalance: number
) {
  const activeInvestments = (investments ?? []).filter(
    (i) => i.status === "active"
  );

  // Simulated bonus on top of real values
  const [bonusMap, setBonusMap] = useState<Record<string, number>>({});
  const [walletBonus, setWalletBonus] = useState(0);
  const [recentProfits, setRecentProfits] = useState<SimulatedProfit[]>([]);
  const [lastFlash, setLastFlash] = useState<{
    type: "balance" | "profit";
    amount: number;
    ts: number;
  } | null>(null);
  const tickRef = useRef(0);

  const tick = useCallback(() => {
    if (activeInvestments.length === 0) return;

    // Pick a random active investment to generate profit from
    const inv =
      activeInvestments[Math.floor(Math.random() * activeInvestments.length)];

    // Calculate a micro-increment based on daily rate
    // daily_rate is e.g. 2.5 meaning 2.5% total return
    // Spread across ~720 ticks/day (every ~2min real, but we compress time)
    const baseIncrement =
      (Number(inv.amount) * (Number(inv.daily_rate) / 100)) / 200;

    // Add fluctuation: -30% to +80% variation
    const fluctuation = 0.7 + Math.random() * 1.1;
    const increment = Math.max(0.01, baseIncrement * fluctuation);

    // Round to 2 decimals
    const roundedIncrement = Math.round(increment * 100) / 100;

    // Update bonus for this investment
    setBonusMap((prev) => ({
      ...prev,
      [inv.id]: (prev[inv.id] || 0) + roundedIncrement,
    }));

    // Add to wallet bonus
    setWalletBonus((prev) => prev + roundedIncrement);

    // Flash indicator
    setLastFlash({ type: "profit", amount: roundedIncrement, ts: Date.now() });

    // Generate a profit entry ~40% of the time
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
        ...prev.slice(0, 19), // keep last 20
      ]);
    }
  }, [activeInvestments]);

  useEffect(() => {
    if (activeInvestments.length === 0) return;

    const scheduleNext = () => {
      // Random delay between 5-8 seconds
      const delay = 5000 + Math.random() * 3000;
      return setTimeout(() => {
        tick();
        tickRef.current = scheduleNext() as unknown as number;
      }, delay);
    };

    // Initial delay 2-4s
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

  // Compute simulated values
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
  };
}
