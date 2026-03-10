import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Bot, Zap, Signal } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const chartData = [
  { t: "09:00", p: 1.0842 }, { t: "10:00", p: 1.0856 }, { t: "11:00", p: 1.0831 },
  { t: "12:00", p: 1.0870 }, { t: "13:00", p: 1.0885 }, { t: "14:00", p: 1.0862 },
  { t: "15:00", p: 1.0891 }, { t: "16:00", p: 1.0905 }, { t: "17:00", p: 1.0918 },
];

const watchlist = [
  { pair: "EUR/USD", price: "1.0918", change: "+0.42%", up: true },
  { pair: "BTC/USDT", price: "67,245", change: "+2.15%", up: true },
  { pair: "GBP/JPY", price: "191.45", change: "-0.18%", up: false },
  { pair: "AAPL", price: "178.52", change: "+1.05%", up: true },
  { pair: "Gold", price: "2,342", change: "+0.67%", up: true },
  { pair: "ETH/USDT", price: "3,528", change: "-0.92%", up: false },
  { pair: "USD/JPY", price: "154.82", change: "+0.31%", up: true },
  { pair: "TSLA", price: "255.30", change: "-1.20%", up: false },
];

const signals = [
  { pair: "EUR/USD", direction: "Buy", confidence: "92%", entry: "1.0910", tp: "1.0960", sl: "1.0880" },
  { pair: "BTC/USDT", direction: "Buy", confidence: "87%", entry: "67,100", tp: "69,500", sl: "66,000" },
  { pair: "Gold", direction: "Sell", confidence: "78%", entry: "2,345", tp: "2,310", sl: "2,365" },
];

const DashboardTrading = () => {
  const [selectedPair, setSelectedPair] = useState("EUR/USD");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Trading</h1>
        <p className="text-muted-foreground text-sm">Execute trades and manage your positions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Watchlist */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {watchlist.map((item) => (
                <button
                  key={item.pair}
                  onClick={() => setSelectedPair(item.pair)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${selectedPair === item.pair ? "bg-muted" : ""}`}
                >
                  <span className="text-sm font-medium text-foreground">{item.pair}</span>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{item.price}</p>
                    <p className={`text-xs flex items-center gap-0.5 justify-end ${item.up ? "text-success" : "text-destructive"}`}>
                      {item.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {item.change}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart + Order */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{selectedPair} Chart</CardTitle>
                <div className="flex gap-1">
                  {["1H", "4H", "1D", "1W"].map((tf) => (
                    <Button key={tf} variant="ghost" size="sm" className="text-xs h-7 px-2 text-muted-foreground">{tf}</Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" stroke="hsl(215, 15%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 15%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
                  <Area type="monotone" dataKey="p" stroke="hsl(145, 60%, 45%)" fill="url(#chartGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order panel */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <Tabs defaultValue="buy">
                <TabsList className="w-full">
                  <TabsTrigger value="buy" className="flex-1 data-[state=active]:bg-success/20 data-[state=active]:text-success">Buy</TabsTrigger>
                  <TabsTrigger value="sell" className="flex-1 data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">Sell</TabsTrigger>
                </TabsList>
                <TabsContent value="buy" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Amount</label>
                      <Input placeholder="0.00" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Price</label>
                      <Input placeholder="Market" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Take Profit</label>
                      <Input placeholder="Optional" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Stop Loss</label>
                      <Input placeholder="Optional" className="mt-1" />
                    </div>
                  </div>
                  <Button className="w-full bg-success text-primary-foreground font-semibold">Place Buy Order</Button>
                </TabsContent>
                <TabsContent value="sell" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Amount</label>
                      <Input placeholder="0.00" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Price</label>
                      <Input placeholder="Market" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Take Profit</label>
                      <Input placeholder="Optional" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Stop Loss</label>
                      <Input placeholder="Optional" className="mt-1" />
                    </div>
                  </div>
                  <Button className="w-full bg-destructive text-destructive-foreground font-semibold">Place Sell Order</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* AI Signals */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-primary" /> AI Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {signals.map((s, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{s.pair}</span>
                  <Badge variant="outline" className={`text-xs ${s.direction === "Buy" ? "border-success text-success" : "border-destructive text-destructive"}`}>
                    {s.direction}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>Confidence: <span className="text-foreground">{s.confidence}</span></span>
                  <span>Entry: <span className="text-foreground">{s.entry}</span></span>
                  <span>TP: <span className="text-success">{s.tp}</span></span>
                  <span>SL: <span className="text-destructive">{s.sl}</span></span>
                </div>
                <Button size="sm" variant="outline" className="w-full text-xs h-7">Copy Trade</Button>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground italic text-center">AI signals are estimates, not financial advice.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTrading;
