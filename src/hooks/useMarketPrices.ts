import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MarketAsset {
  symbol: string;
  displayName: string;
  price: number;
  prevPrice: number;
  change24h: number;
  source: "binance" | "simulated";
}

const BINANCE_SYMBOLS = [
  { symbol: "BTCUSDT", displayName: "BTC/USDT" },
  { symbol: "ETHUSDT", displayName: "ETH/USDT" },
  { symbol: "SOLUSDT", displayName: "SOL/USDT" },
  { symbol: "BNBUSDT", displayName: "BNB/USDT" },
  { symbol: "XRPUSDT", displayName: "XRP/USDT" },
];

const SIMULATED_ASSETS: { displayName: string; basePrice: number }[] = [
  { displayName: "EUR/USD", basePrice: 1.0918 },
  { displayName: "GBP/JPY", basePrice: 191.45 },
  { displayName: "USD/JPY", basePrice: 154.82 },
  { displayName: "AAPL", basePrice: 178.52 },
  { displayName: "TSLA", basePrice: 255.30 },
  { displayName: "Gold", basePrice: 2342.0 },
  { displayName: "S&P 500", basePrice: 5234.18 },
  { displayName: "Oil", basePrice: 78.42 },
];

async function fetchBinancePrices(): Promise<Record<string, { price: number; change: number }>> {
  const symbols = BINANCE_SYMBOLS.map((s) => s.symbol);
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

function jitter(base: number, maxPct = 0.001): number {
  return base * (1 + (Math.random() - 0.5) * 2 * maxPct);
}

export function useMarketPrices(intervalMs = 5000) {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const prevPricesRef = useRef<Record<string, number>>({});
  const simDriftRef = useRef<Record<string, number>>({});

  useEffect(() => {
    for (const a of SIMULATED_ASSETS) {
      simDriftRef.current[a.displayName] = (Math.random() - 0.5) * 2;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const binance = await fetchBinancePrices();

      setAssets(() => {
        const prevMap = { ...prevPricesRef.current };
        const next: MarketAsset[] = [];

        for (const s of BINANCE_SYMBOLS) {
          const d = binance[s.symbol];
          if (d) {
            next.push({
              symbol: s.symbol,
              displayName: s.displayName,
              price: d.price,
              prevPrice: prevMap[s.displayName] ?? d.price,
              change24h: d.change,
              source: "binance",
            });
            prevMap[s.displayName] = d.price;
          }
        }

        for (const a of SIMULATED_ASSETS) {
          const last = prevMap[a.displayName] ?? a.basePrice;
          const newPrice = jitter(last);
          const drift = simDriftRef.current[a.displayName] ?? 0;
          const change24h = ((newPrice - a.basePrice) / a.basePrice) * 100 + drift;
          next.push({
            symbol: a.displayName,
            displayName: a.displayName,
            price: newPrice,
            prevPrice: last,
            change24h: parseFloat(change24h.toFixed(2)),
            source: "simulated",
          });
          prevMap[a.displayName] = newPrice;
        }

        prevPricesRef.current = prevMap;
        return next;
      });
    } catch {
      // On error, update simulated only
      setAssets((prev) => {
        const prevMap = { ...prevPricesRef.current };
        const next: MarketAsset[] = [];

        for (const a of SIMULATED_ASSETS) {
          const last = prevMap[a.displayName] ?? a.basePrice;
          const newPrice = jitter(last);
          const drift = simDriftRef.current[a.displayName] ?? 0;
          const change24h = ((newPrice - a.basePrice) / a.basePrice) * 100 + drift;
          next.push({
            symbol: a.displayName,
            displayName: a.displayName,
            price: newPrice,
            prevPrice: last,
            change24h: parseFloat(change24h.toFixed(2)),
            source: "simulated",
          });
          prevMap[a.displayName] = newPrice;
        }

        prevPricesRef.current = prevMap;
        return next;
      });
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return assets;
}
