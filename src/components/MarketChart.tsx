import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

type TimeRange = "1H" | "1D" | "1W" | "1M" | "3M" | "1Y";

interface MarketChartProps {
  title?: string;
  basePrice: number;
  symbol: string;
  /** If provided, the chart uses this as the current live price */
  livePrice?: number;
}

function generateChartData(basePrice: number, range: TimeRange, livePrice?: number): { time: string; price: number }[] {
  const points: { time: string; price: number }[] = [];
  let count: number;
  let volatility: number;
  let labelFn: (i: number, total: number) => string;

  switch (range) {
    case "1H":
      count = 60;
      volatility = 0.0003;
      labelFn = (i) => `${i}m`;
      break;
    case "1D":
      count = 96; // 15-min intervals
      volatility = 0.0008;
      labelFn = (i) => {
        const h = Math.floor((i * 15) / 60);
        const m = (i * 15) % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      };
      break;
    case "1W":
      count = 7 * 24;
      volatility = 0.0015;
      labelFn = (i) => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days[Math.floor(i / 24) % 7];
      };
      break;
    case "1M":
      count = 30;
      volatility = 0.003;
      labelFn = (i) => `${i + 1}`;
      break;
    case "3M":
      count = 90;
      volatility = 0.005;
      labelFn = (i) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = Math.floor(i / 30);
        return i % 15 === 0 ? months[(new Date().getMonth() - 2 + monthIndex + 12) % 12] : "";
      };
      break;
    case "1Y":
      count = 365;
      volatility = 0.008;
      labelFn = (i) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = Math.floor(i / 30);
        return i % 30 === 0 ? months[(new Date().getMonth() + monthIndex + 1) % 12] : "";
      };
      break;
  }

  // Use a seeded random based on symbol + range for consistency during renders
  let seed = 0;
  for (let i = 0; i < (range + basePrice.toString()).length; i++) {
    seed += (range + basePrice.toString()).charCodeAt(i);
  }
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let price = basePrice * (1 - volatility * count * 0.3 * (seededRandom() - 0.3));
  const targetEnd = livePrice ?? basePrice;

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    // Trend towards the target end price
    const trendBias = (targetEnd - price) / (count - i) * 0.5;
    const noise = price * volatility * (seededRandom() - 0.48);
    price = price + trendBias + noise;
    if (price <= 0) price = basePrice * 0.01;

    const label = labelFn(i, count);
    points.push({ time: label, price: parseFloat(price.toFixed(price > 100 ? 2 : 4)) });
  }

  return points;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const price = payload[0].value;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono font-semibold text-foreground">
          {price >= 1 ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${price.toFixed(4)}`}
        </p>
      </div>
    );
  }
  return null;
};

const MarketChart = ({ title = "Live Trading Chart", basePrice, symbol, livePrice }: MarketChartProps) => {
  const [range, setRange] = useState<TimeRange>("1D");

  const data = useMemo(
    () => generateChartData(basePrice, range, livePrice),
    [basePrice, range, livePrice]
  );

  const firstPrice = data[0]?.price ?? basePrice;
  const lastPrice = data[data.length - 1]?.price ?? basePrice;
  const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = changePercent >= 0;
  const strokeColor = isPositive ? "hsl(145, 60%, 45%)" : "hsl(0, 70%, 50%)";
  const gradientId = `chartGradient-${symbol.replace(/[^a-zA-Z]/g, "")}`;

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const padding = (maxPrice - minPrice) * 0.1;

  const ranges: TimeRange[] = ["1H", "1D", "1W", "1M", "3M", "1Y"];

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm md:text-lg">{title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-foreground text-sm">
                  {lastPrice >= 1
                    ? `$${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$${lastPrice.toFixed(4)}`}
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-primary" : "text-destructive"}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-1">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220, 15%, 16%)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={[minPrice - padding, maxPrice + padding]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }}
                width={60}
                tickFormatter={(val) =>
                  val >= 1000
                    ? `$${(val / 1000).toFixed(1)}k`
                    : val >= 1
                    ? `$${val.toFixed(0)}`
                    : `$${val.toFixed(2)}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: strokeColor,
                  stroke: "hsl(220, 20%, 4%)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom info */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{symbol}</span>
          <span className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Simulated data · For illustration purposes
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketChart;
