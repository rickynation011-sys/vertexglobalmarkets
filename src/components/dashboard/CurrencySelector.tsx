import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/contexts/CurrencyContext";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger className="w-[80px] h-8 text-xs border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {SUPPORTED_CURRENCIES.map(c => (
          <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
