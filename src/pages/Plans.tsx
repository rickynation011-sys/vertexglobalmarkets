import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Shield, Clock, TrendingUp, Gem, Rocket, Crown, Landmark } from "lucide-react";

const plans = [
  {
    name: "Starter Plan",
    icon: Gem,
    minInvestment: "$200",
    duration: "30 days",
    dailyRate: "1% – 2%",
    expectedReturn: "Variable",
    features: ["Daily interest accrual", "Withdraw anytime after maturity", "Email performance reports", "Capital monitoring tools"],
  },
  {
    name: "Growth Plan",
    icon: Rocket,
    minInvestment: "$500",
    duration: "60 days",
    dailyRate: "1.5% – 2.5%",
    expectedReturn: "Variable",
    features: ["Diversified asset allocation", "AI-assisted rebalancing", "Weekly performance reports", "Priority withdrawal processing", "Dedicated account manager"],
    popular: true,
  },
  {
    name: "Advanced Plan",
    icon: Crown,
    minInvestment: "$1,000",
    duration: "90 days",
    dailyRate: "2% – 3%",
    expectedReturn: "Variable",
    features: ["Advanced trading strategies", "Daily analytics dashboard", "VIP support line", "Custom risk parameters", "Early withdrawal option", "Priority processing"],
  },
];

const benefits = [
  { icon: Shield, title: "Segregated Funds", description: "All invested capital is held in segregated tier-1 bank accounts, separate from operational funds." },
  { icon: Clock, title: "Flexible Terms", description: "Choose investment durations from 30 to 365 days. Early withdrawal available on select plans." },
  { icon: TrendingUp, title: "Compounding Returns", description: "Reinvest your returns automatically to maximize compound growth over time." },
];

const Plans = () => (
  <StaticPageLayout>
    <SEO title="Investment Plans" description="Structured investment plans with expected returns up to 45%. Choose from Starter, Balanced, Aggressive, and Institutional tiers." path="/plans" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Investment <span className="text-gradient-brand">Plans</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Structured investment solutions designed for every level of investor. Choose a plan that matches your goals and risk appetite.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-gradient-to-b from-card to-background transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_hsl(var(--gold)/0.12)] ${
                plan.popular
                  ? "border-gold ring-1 ring-gold/30"
                  : "border-border hover:border-gold/40"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground text-[10px] md:text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap z-10">
                  Most Popular
                </span>
              )}
              <CardContent className="flex flex-col flex-1 p-4 md:p-6 pt-6 md:pt-8">
                {/* Icon */}
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <plan.icon className="h-6 w-6 text-gold" />
                </div>

                {/* Name */}
                <h3 className="text-sm md:text-lg font-display font-bold text-foreground text-center mb-1">
                  {plan.name}
                </h3>

                {/* Min investment */}
                <p className="text-xs text-muted-foreground text-center mb-3">
                  {plan.minInvestment} min
                </p>

                {/* Daily rate */}
                <p className="text-xl md:text-2xl font-display font-bold text-center text-success mb-1">
                  {plan.dailyRate}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground text-center mb-4">
                  daily · {plan.expectedReturn} total · {plan.duration}
                </p>

                {/* Features */}
                <ul className="space-y-1.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-[10px] md:text-xs text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 text-gold shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>

                {/* Button pinned to bottom */}
                <Button
                  className={`w-full mt-auto ${
                    plan.popular
                      ? "bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
                      : "border-gold/30 text-gold hover:bg-gold/10"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Why Invest With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {benefits.map((b) => (
            <Card key={b.title} className="rounded-2xl border-border bg-gradient-to-b from-card to-background hover:border-gold/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <b.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-muted-foreground">
              ⚠️ Investment returns are estimated based on historical performance. Your capital is at risk. Please read our <Link to="/risk-disclosure" className="text-primary underline">Risk Disclosure</Link> before investing.
            </p>
          </div>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Plans;
