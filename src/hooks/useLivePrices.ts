import { useState, useEffect, useRef, useCallback } from "react";

export interface LivePrice {
  symbol: string;
  displayName: string;
  price: number;
  prevPrice: number;
  change24h: number;
  source: "binance" | "simulated";
}

interface SymbolConfig {
  binanceSymbol?: string; // If provided, fetch from Binance
  displayName: string;
  basePrice: number; // Used as fallback / simulation base
}

async function fetchBinance24hr(symbols: string[]): Promise<Record<string, { price: number; change: number }>> {
  if (symbols.length === 0) return {};
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Binance API error");
  const data: { symbol: string; lastPrice: string; priceChangePercent: string }[] = await res.json();
  const map: Record<string, { price: number; change: number }> = {};
  for (const d of data) {
    map[d.symbol] = { price: parseFloat(d.lastPrice), change: parseFloat(d.priceChangePercent) };
  }
  return map;
}

function jitter(base: number, maxPct = 0.0008): number {
  return base * (1 + (Math.random() - 0.5) * 2 * maxPct);
}

export function useLivePrices(configs: SymbolConfig[], intervalMs = 4000) {
  const [prices, setPrices] = useState<LivePrice[]>([]);
  const prevRef = useRef<Record<string, number>>({});
  const driftRef = useRef<Record<string, number>>({});

  useEffect(() => {
    for (const c of configs) {
      if (!driftRef.current[c.displayName]) {
        driftRef.current[c.displayName] = (Math.random() - 0.5) * 2;
      }
    }
  }, [configs]);

  const refresh = useCallback(async () => {
    try {
      const binanceSymbols = configs.filter((c) => c.binanceSymbol).map((c) => c.binanceSymbol!);
      const binanceData = await fetchBinance24hr(binanceSymbols);

      setPrices(() => {
        const prevMap = { ...prevRef.current };
        const next: LivePrice[] = [];

        for (const c of configs) {
          if (c.binanceSymbol && binanceData[c.binanceSymbol]) {
            const d = binanceData[c.binanceSymbol];
            next.push({
              symbol: c.binanceSymbol,
              displayName: c.displayName,
              price: d.price,
              prevPrice: prevMap[c.displayName] ?? d.price,
              change24h: d.change,
              source: "binance",
            });
            prevMap[c.displayName] = d.price;
          } else {
            const last = prevMap[c.displayName] ?? c.basePrice;
            const newPrice = jitter(last);
            const drift = driftRef.current[c.displayName] ?? 0;
            const change = ((newPrice - c.basePrice) / c.basePrice) * 100 + drift;
            next.push({
              symbol: c.displayName,
              displayName: c.displayName,
              price: newPrice,
              prevPrice: last,
              change24h: parseFloat(change.toFixed(2)),
              source: "simulated",
            });
            prevMap[c.displayName] = newPrice;
          }
        }

        prevRef.current = prevMap;
        return next;
      });
    } catch {
      // Keep stale data on error
    }
  }, [configs]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return prices;
}
