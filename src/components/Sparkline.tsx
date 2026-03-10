import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  basePrice: number;
  change: number;
  width?: number;
  height?: number;
}

const Sparkline = ({ basePrice, change, width = 60, height = 28 }: SparklineProps) => {
  const data = useMemo(() => {
    const points = 20;
    const result = [];
    const seed = Math.abs(basePrice * 1000) % 1000;
    const endPrice = basePrice * (1 + change / 100);
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const trend = basePrice + (endPrice - basePrice) * progress;
      const noise = Math.sin(seed + i * 1.7) * basePrice * 0.005 +
                    Math.cos(seed * 0.3 + i * 2.3) * basePrice * 0.003;
      result.push({ v: trend + noise });
    }
    return result;
  }, [basePrice, change]);

  const color = change >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  return (
    <div style={{ width, height }} className="hidden md:block">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;
