import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Brain, Target, Clock, Bell, TrendingUp, BarChart3, Zap, CheckCircle } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", description: "Our machine learning models analyze millions of data points across price action, volume, sentiment, and macroeconomic indicators." },
  { icon: Target, title: "High-Probability Setups", description: "Each signal includes entry price, stop-loss, and take-profit levels with a historical win rate of 72%+." },
  { icon: Clock, title: "Real-Time Delivery", description: "Receive signals instantly via push notifications, email, Telegram, and in-platform alerts." },
  { icon: Bell, title: "Multi-Asset Coverage", description: "Signals across forex, crypto, commodities, and indices — covering both short-term scalps and swing trades." },
];

const recentSignals = [
  { pair: "EUR/USD", direction: "Buy", entry: "1.0842", tp: "1.0895", sl: "1.0810", status: "Hit TP", profit: "+53 pips" },
  { pair: "BTC/USD", direction: "Sell", entry: "68,450", tp: "66,800", sl: "69,200", status: "Hit TP", profit: "+$1,650" },
  { pair: "XAU/USD", direction: "Buy", entry: "2,315", tp: "2,348", sl: "2,298", status: "Hit TP", profit: "+$33" },
  { pair: "GBP/JPY", direction: "Sell", entry: "191.45", tp: "190.20", sl: "192.10", status: "Active", profit: "—" },
];

const plans = [
  { name: "Basic", price: "Free", features: ["2 signals/day", "Forex only", "Email delivery", "24h delay"] },
  { name: "Pro", price: "$49/mo", features: ["10 signals/day", "All assets", "Real-time delivery", "Telegram alerts", "Risk calculator"], popular: true },
  { name: "Elite", price: "$149/mo", features: ["Unlimited signals", "All assets + early access", "API integration", "1-on-1 analyst calls", "Custom alerts"] },
];

const Signals = () => (
  <StaticPageLayout>
    <SEO title="Trading Signals" description="AI-powered trading signals with 72%+ win rate across forex, crypto, and commodities. Real-time alerts delivered to your device." path="/signals" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Zap className="h-3 w-3 mr-1" /> AI-Powered
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Trading <span className="text-gradient-brand">Signals</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Institutional-grade trade ideas powered by artificial intelligence, delivered in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((f) => (
            <Card key={f.title} className="bg-card border-border">
              <CardContent className="p-6">
                <f.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-8">Recent Signals</h2>
        <div className="overflow-x-auto mb-20">
          <table className="w-full max-w-4xl mx-auto text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Pair</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Direction</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Entry</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">TP</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">SL</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {recentSignals.map((sig, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-foreground">{sig.pair}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={sig.direction === "Buy" ? "text-emerald-400 border-emerald-400/30" : "text-red-400 border-red-400/30"}>
                      {sig.direction}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{sig.entry}</td>
                  <td className="py-3 px-4 text-muted-foreground">{sig.tp}</td>
                  <td className="py-3 px-4 text-muted-foreground">{sig.sl}</td>
                  <td className="py-3 px-4">
                    <Badge variant={sig.status === "Hit TP" ? "default" : "secondary"} className={sig.status === "Hit TP" ? "bg-emerald-500/10 text-emerald-400" : ""}>
                      {sig.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">{sig.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Signal Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-card border-border relative ${plan.popular ? "border-primary ring-1 ring-primary/30" : ""}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
              )}
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-display font-bold text-foreground">{plan.name}</h3>
                <p className="text-3xl font-display font-bold text-gradient-brand my-4">{plan.price}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.popular ? "bg-gradient-brand text-primary-foreground font-semibold" : ""}`} variant={plan.popular ? "default" : "outline"} asChild>
                  <Link to="/register">{plan.price === "Free" ? "Get Started" : "Subscribe"}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Signals;
