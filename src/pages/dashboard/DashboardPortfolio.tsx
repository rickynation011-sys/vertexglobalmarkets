import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const performanceData = [
  { month: "Jan", profit: 1200, loss: -400 },
  { month: "Feb", profit: 1800, loss: -200 },
  { month: "Mar", profit: 900, loss: -600 },
  { month: "Apr", profit: 2200, loss: -100 },
  { month: "May", profit: 1500, loss: -300 },
  { month: "Jun", profit: 2800, loss: -150 },
];

const holdings = [
  { asset: "Bitcoin (BTC)", qty: "0.45 BTC", value: "$27,450.00", pnl: "+$4,200.00", change: "+18.1%", up: true },
  { asset: "EUR/USD", qty: "50,000 units", value: "$52,300.00", pnl: "+$1,840.00", change: "+3.6%", up: true },
  { asset: "Apple (AAPL)", qty: "85 shares", value: "$14,875.00", pnl: "-$320.00", change: "-2.1%", up: false },
  { asset: "Gold (XAU)", qty: "2.5 oz", value: "$4,875.00", pnl: "+$625.00", change: "+14.7%", up: true },
  { asset: "Ethereum (ETH)", qty: "5.2 ETH", value: "$9,620.00", pnl: "+$1,120.00", change: "+13.2%", up: true },
  { asset: "Tesla (TSLA)", qty: "40 shares", value: "$10,200.00", pnl: "+$800.00", change: "+8.5%", up: true },
];

const DashboardPortfolio = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Portfolio</h1>
        <p className="text-muted-foreground text-sm">Track your holdings and performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-display font-bold text-foreground">$119,320.00</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1"><ArrowUp className="h-3 w-3" /> +12.4% this month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total P&L</p>
            <p className="text-2xl font-display font-bold text-success">+$8,265.00</p>
            <p className="text-xs text-muted-foreground mt-1">Unrealized gains</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Monthly Return</p>
            <p className="text-2xl font-display font-bold text-foreground">7.2%</p>
            <p className="text-xs text-muted-foreground mt-1">Estimated (not guaranteed)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Monthly P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={performanceData}>
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
              <Bar dataKey="profit" fill="hsl(145, 60%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loss" fill="hsl(0, 70%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Asset</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Quantity</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Value</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">P&L</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium text-foreground">{h.asset}</td>
                    <td className="py-3 text-muted-foreground">{h.qty}</td>
                    <td className="py-3 text-foreground">{h.value}</td>
                    <td className={`py-3 ${h.up ? "text-success" : "text-destructive"}`}>{h.pnl}</td>
                    <td className={`py-3 text-right flex items-center justify-end gap-1 ${h.up ? "text-success" : "text-destructive"}`}>
                      {h.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {h.change}
                    </td>
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

export default DashboardPortfolio;
