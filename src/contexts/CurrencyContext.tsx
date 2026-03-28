import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CAD: "C$", NGN: "₦", JPY: "¥", AUD: "A$",
  CHF: "CHF", CNY: "¥", INR: "₹", BRL: "R$", ZAR: "R", KES: "KSh",
  GHS: "GH₵", AED: "د.إ", SAR: "﷼", MXN: "MX$", SGD: "S$", HKD: "HK$",
  NZD: "NZ$", SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł", TRY: "₺",
  KRW: "₩", THB: "฿", MYR: "RM", PHP: "₱", IDR: "Rp", COP: "COL$",
  EGP: "E£", PKR: "₨", BDT: "৳", VND: "₫", UAH: "₴", RUB: "₽",
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  rates: Record<string, number>;
  convert: (usdAmount: number) => number;
  format: (usdAmount: number) => string;
  symbol: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  rates: {},
  convert: (n) => n,
  format: (n) => `$${n.toFixed(2)}`,
  symbol: "$",
  loading: false,
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Load user's saved currency preference
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("currency").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data?.currency) setCurrencyState(data.currency);
      });
  }, [user]);

  // Fetch exchange rates
  useEffect(() => {
    setLoading(true);
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    fetch(`https://${projectId}.supabase.co/functions/v1/exchange-rates?base=USD`, {
      headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    })
      .then(r => r.json())
      .then(data => { if (data.rates) setRates(data.rates); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c);
    if (user) {
      supabase.from("profiles").update({ currency: c } as any).eq("user_id", user.id).then(() => {});
    }
  }, [user]);

  const convert = useCallback((usdAmount: number) => {
    if (currency === "USD" || !rates[currency]) return usdAmount;
    return usdAmount * rates[currency];
  }, [currency, rates]);

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const format = useCallback((usdAmount: number) => {
    const converted = convert(usdAmount);
    return `${symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [convert, symbol]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, format, symbol, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "NZD", "CHF", "JPY", "CNY", "INR",
  "NGN", "GHS", "KES", "ZAR", "EGP", "BRL", "MXN", "COP", "AED", "SAR",
  "SGD", "HKD", "KRW", "THB", "MYR", "PHP", "IDR", "PKR", "BDT", "VND",
  "TRY", "PLN", "SEK", "NOK", "DKK", "UAH", "RUB",
];

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  "United States": "USD", "Canada": "CAD", "United Kingdom": "GBP",
  "Germany": "EUR", "France": "EUR", "Italy": "EUR", "Spain": "EUR",
  "Netherlands": "EUR", "Belgium": "EUR", "Austria": "EUR", "Ireland": "EUR",
  "Portugal": "EUR", "Finland": "EUR", "Greece": "EUR", "Luxembourg": "EUR",
  "Nigeria": "NGN", "Ghana": "GHS", "Kenya": "KES", "South Africa": "ZAR",
  "Egypt": "EGP", "Japan": "JPY", "China": "CNY", "India": "INR",
  "Australia": "AUD", "New Zealand": "NZD", "Switzerland": "CHF",
  "Brazil": "BRL", "Mexico": "MXN", "Colombia": "COP",
  "United Arab Emirates": "AED", "Saudi Arabia": "SAR", "Singapore": "SGD",
  "Hong Kong": "HKD", "South Korea": "KRW", "Thailand": "THB",
  "Malaysia": "MYR", "Philippines": "PHP", "Indonesia": "IDR",
  "Pakistan": "PKR", "Bangladesh": "BDT", "Vietnam": "VND",
  "Turkey": "TRY", "Poland": "PLN", "Sweden": "SEK", "Norway": "NOK",
  "Denmark": "DKK", "Ukraine": "UAH", "Russia": "RUB",
  "Argentina": "ARS", "Chile": "CLP", "Peru": "PEN",
};

export const COUNTRIES = Object.keys(COUNTRY_CURRENCY_MAP).sort();
