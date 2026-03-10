import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LivePrice {
  symbol: string;
  displayName: string;
  price: number;
  prevPrice: number;
  change24h: number;
  source: "binance" | "simulated";
}

interface SymbolConfig {
  binanceSymbol?: string;
  displayName: string;
  basePrice: number;
}

async function fetchBinanceViaProxy(symbols: string[]): Promise<Record<string, { price: number; change: number }>> {
  if (symbols.length === 0) return {};
  
  const { data, error } = await supabase.functions.invoke("binance-proxy", {
    body: { symbols },
  });

  if (error) throw error;

  const map: Record<string, { price: number; change: number }> = {};
  if (Array.isArray(data)) {
    for (const d of data) {
      map[d.symbol] = { price: d.price, change: d.change };
    }
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
      const binanceData = await fetchBinanceViaProxy(binanceSymbols);

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
      // On error, still update simulated prices
      setPrices((prev) => {
        const prevMap = { ...prevRef.current };
        const next: LivePrice[] = [];

        for (const c of configs) {
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

        prevRef.current = prevMap;
        return next;
      });
    }
  }, [configs]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return prices;
}
