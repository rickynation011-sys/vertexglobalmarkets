import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap, Crown, Star, Target } from "lucide-react";

const plans = [
  {
    name: "Conservative Growth",
    icon: Shield,
    returns: "4-6%",
    risk: "Low",
    min: "$500",
    duration: "30 days",
    description: "Stable returns through diversified bonds, ETFs, and blue-chip stocks.",
    features: ["AI Risk Management", "Auto-rebalancing", "Daily reports"],
    popular: false,
  },
  {
    name: "Balanced Portfolio",
    icon: Target,
    returns: "6-9%",
    risk: "Medium",
    min: "$2,000",
    duration: "30 days",
    description: "Mix of growth stocks, forex, and crypto for balanced risk-reward.",
    features: ["Multi-asset exposure", "Smart hedging", "Weekly analytics"],
    popular: true,
  },
  {
    name: "Aggressive Alpha",
    icon: Zap,
    returns: "8-12%",
    risk: "High",
    min: "$5,000",
    duration: "30 days",
    description: "High-frequency algorithmic trading across volatile markets.",
    features: ["AI signal trading", "Leveraged positions", "Real-time alerts"],
    popular: false,
  },
  {
    name: "Forex Specialist",
    icon: TrendingUp,
    returns: "5-8%",
    risk: "Medium",
    min: "$1,000",
    duration: "30 days",
    description: "Dedicated forex strategy across major and minor currency pairs.",
    features: ["24/5 trading", "News-driven AI", "Spread optimization"],
    popular: false,
  },
  {
    name: "Crypto Momentum",
    icon: Star,
    returns: "7-12%",
    risk: "High",
    min: "$1,500",
    duration: "30 days",
    description: "Capitalize on crypto market trends using AI momentum indicators.",
    features: ["Top 20 cryptos", "DeFi yield", "Auto stop-loss"],
    popular: false,
  },
  {
    name: "VIP Elite",
    icon: Crown,
    returns: "10-15%",
    risk: "Variable",
    min: "$25,000",
    duration: "30 days",
    description: "Exclusive strategies with dedicated account management and priority execution.",
    features: ["Personal manager", "Priority execution", "Custom strategies"],
    popular: false,
  },
];

const activeInvestments = [
  { plan: "Balanced Portfolio", invested: "$10,000", current: "$10,720", return: "+7.2%", daysLeft: 18 },
  { plan: "Crypto Momentum", invested: "$5,000", current: "$5,480", return: "+9.6%", daysLeft: 22 },
  { plan: "Conservative Growth", invested: "$15,000", current: "$15,675", return: "+4.5%", daysLeft: 8 },
];

const DashboardInvestments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Investments</h1>
        <p className="text-muted-foreground text-sm">Browse plans and manage active investments</p>
      </div>

      {/* Active investments */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Invested</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Current</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Return</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {activeInvestments.map((inv, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium text-foreground">{inv.plan}</td>
                    <td className="py-3 text-muted-foreground">{inv.invested}</td>
                    <td className="py-3 text-foreground">{inv.current}</td>
                    <td className="py-3 text-success">{inv.return}</td>
                    <td className="py-3 text-right text-muted-foreground">{inv.daysLeft} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investment plans */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-card border-border relative ${plan.popular ? "ring-1 ring-primary" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-4 bg-gradient-brand text-primary-foreground text-xs">Most Popular</Badge>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <plan.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Monthly Returns</span>
                  <span className="text-success font-semibold">{plan.returns}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Level</span>
                  <Badge variant="outline" className="text-xs">{plan.risk}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum</span>
                  <span className="text-foreground font-medium">{plan.min}</span>
                </div>
                <div className="space-y-1">
                  {plan.features.map((f) => (
                    <p key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary" /> {f}
                    </p>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic">*Returns are estimates, not guaranteed profits.</p>
                <Button className="w-full bg-gradient-brand text-primary-foreground font-semibold" size="sm">
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardInvestments;
