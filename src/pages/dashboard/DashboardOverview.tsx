import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Briefcase, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const portfolioData = [
  { date: "Jan", value: 10000 },
  { date: "Feb", value: 11200 },
  { date: "Mar", value: 10800 },
  { date: "Apr", value: 12500 },
  { date: "May", value: 13800 },
  { date: "Jun", value: 15200 },
  { date: "Jul", value: 14900 },
  { date: "Aug", value: 16800 },
  { date: "Sep", value: 18200 },
  { date: "Oct", value: 19500 },
];

const allocationData = [
  { name: "Forex", value: 30, color: "hsl(145, 60%, 45%)" },
  { name: "Crypto", value: 25, color: "hsl(195, 70%, 45%)" },
  { name: "Stocks", value: 20, color: "hsl(215, 60%, 50%)" },
  { name: "Commodities", value: 15, color: "hsl(40, 90%, 55%)" },
  { name: "Bonds", value: 10, color: "hsl(280, 50%, 50%)" },
];

const recentTrades = [
  { asset: "EUR/USD", type: "Buy", amount: "+$420.00", status: "Completed", time: "2 min ago" },
  { asset: "BTC/USDT", type: "Sell", amount: "+$1,280.00", status: "Completed", time: "15 min ago" },
  { asset: "AAPL", type: "Buy", amount: "-$3,200.00", status: "Pending", time: "1 hr ago" },
  { asset: "Gold", type: "Buy", amount: "+$890.00", status: "Completed", time: "3 hr ago" },
  { asset: "ETH/USDT", type: "Sell", amount: "+$650.00", status: "Completed", time: "5 hr ago" },
];

const stats = [
  { label: "Account Balance", value: "$19,500.00", change: "+8.2%", up: true, icon: DollarSign },
  { label: "Total Profit", value: "$9,500.00", change: "+95%", up: true, icon: TrendingUp },
  { label: "Active Investments", value: "12", change: "+3", up: true, icon: Briefcase },
  { label: "Win Rate", value: "78.4%", change: "+2.1%", up: true, icon: Activity },
];

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, Investor</h1>
        <p className="text-muted-foreground text-sm">Here's your portfolio overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-display font-bold text-foreground">{stat.value}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(215, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(145, 60%, 45%)" fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {allocationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  {item.name} {item.value}%
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent trades */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Asset</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Type</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium text-foreground">{trade.asset}</td>
                    <td className={`py-3 ${trade.type === "Buy" ? "text-success" : "text-destructive"}`}>{trade.type}</td>
                    <td className="py-3 text-foreground">{trade.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${trade.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{trade.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
