import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useMemo } from "react";
import { useLivePrices } from "@/hooks/useLivePrices";
import MarketChart from "@/components/MarketChart";

const cryptoConfigs = [
  { displayName: "Bitcoin (BTC)", binanceSymbol: "BTCUSDT", basePrice: 67432 },
  { displayName: "Ethereum (ETH)", binanceSymbol: "ETHUSDT", basePrice: 3542 },
  { displayName: "Solana (SOL)", binanceSymbol: "SOLUSDT", basePrice: 178.45 },
  { displayName: "XRP", binanceSymbol: "XRPUSDT", basePrice: 2.18 },
  { displayName: "BNB", binanceSymbol: "BNBUSDT", basePrice: 605 },
  { displayName: "Cardano (ADA)", binanceSymbol: "ADAUSDT", basePrice: 0.682 },
  { displayName: "Dogecoin (DOGE)", binanceSymbol: "DOGEUSDT", basePrice: 0.1245 },
  { displayName: "Avalanche (AVAX)", binanceSymbol: "AVAXUSDT", basePrice: 38.92 },
  { displayName: "Chainlink (LINK)", binanceSymbol: "LINKUSDT", basePrice: 18.45 },
  { displayName: "Polkadot (DOT)", binanceSymbol: "DOTUSDT", basePrice: 7.85 },
  { displayName: "Polygon (MATIC)", binanceSymbol: "MATICUSDT", basePrice: 0.892 },
  { displayName: "Litecoin (LTC)", binanceSymbol: "LTCUSDT", basePrice: 85.40 },
];

const MarketCrypto = () => {
  const hookConfigs = useMemo(() => cryptoConfigs.map((c) => ({
    displayName: c.displayName,
    binanceSymbol: c.binanceSymbol,
    basePrice: c.basePrice,
  })), []);

  const livePrices = useLivePrices(hookConfigs, 4000);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  return (
    <StaticPageLayout>
      <SEO title="Crypto Trading | Vertex Global Markets" description="Trade 200+ cryptocurrencies with live Binance prices — Bitcoin, Ethereum, and altcoins 24/7." path="/markets/crypto" />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-5xl mb-4">₿</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Crypto <span className="text-gradient-brand">Trading</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Access Bitcoin, Ethereum, and 200+ altcoins — trade crypto 24/7 with live Binance prices.
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Live Binance Prices · Updates every 4s</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Cryptocurrencies", value: "200+" },
              { label: "Trading", value: "24/7", icon: <Clock className="h-4 w-4 text-primary mx-auto mb-1" /> },
              { label: "Min Trade", value: "$1" },
              { label: "Max Leverage", value: "1:100" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
                {s.icon}
                <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Markets Open 24/7</span>
          </div>

          <div className="space-y-3 mb-12">
            {cryptoConfigs.map((coin) => {
              const data = livePrices.find((p) => p.displayName === coin.displayName);
              const price = data?.price ?? coin.basePrice;
              const change = data?.change24h ?? 0;
              const up = change >= 0;
              const flash = data && data.price !== data.prevPrice;
              const symbol = coin.displayName.match(/\((\w+)\)/)?.[1] || coin.displayName;

              return (
                <div
                  key={coin.displayName}
                  className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all ${
                    flash ? "ring-1 ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {up ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <div>
                      <span className="font-display font-semibold text-foreground">{coin.displayName.split(" (")[0]}</span>
                      <span className="text-xs text-muted-foreground ml-2">{symbol}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 text-sm">
                    <span className={`font-mono text-foreground transition-colors ${flash ? (up ? "text-primary" : "text-destructive") : ""}`}>
                      {formatPrice(price)}
                    </span>
                    <span className={`font-medium ${up ? "text-primary" : "text-destructive"}`}>
                      {up ? "+" : ""}{change.toFixed(2)}%
                    </span>
                    {data?.source === "binance" && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded hidden md:block">LIVE</span>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 font-semibold" asChild>
                        <Link to="/register">Buy</Link>
                      </Button>
                      <Button size="sm" variant="outline" className="font-semibold" asChild>
                        <Link to="/register">Sell</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-12">
            <MarketChart
              title="Bitcoin (BTC/USDT)"
              basePrice={67432}
              symbol="BTC/USDT"
              livePrice={livePrices.find((p) => p.displayName === "Bitcoin (BTC)")?.price}
            />
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
              <Link to="/register">Start Trading Crypto</Link>
            </Button>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default MarketCrypto;
