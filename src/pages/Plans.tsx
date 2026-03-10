import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Shield, Clock, TrendingUp } from "lucide-react";

const plans = [
  {
    name: "Starter Growth",
    minInvestment: "$500",
    duration: "30 days",
    expectedReturn: "5-8%",
    features: ["Capital protection guarantee", "Daily interest accrual", "Withdraw anytime after maturity", "Email performance reports"],
  },
  {
    name: "Balanced Portfolio",
    minInvestment: "$2,500",
    duration: "90 days",
    expectedReturn: "12-18%",
    features: ["Diversified asset allocation", "AI rebalancing", "Weekly performance reports", "Priority withdrawal processing", "Dedicated account manager"],
    popular: true,
  },
  {
    name: "Aggressive Growth",
    minInvestment: "$10,000",
    duration: "180 days",
    expectedReturn: "20-35%",
    features: ["High-yield strategies", "Leveraged positions", "Daily analytics dashboard", "VIP support line", "Custom risk parameters", "Early withdrawal option"],
  },
  {
    name: "Institutional",
    minInvestment: "$50,000",
    duration: "365 days",
    expectedReturn: "25-45%",
    features: ["Custom portfolio construction", "Direct market access", "Quarterly strategy reviews", "Tax optimization support", "Dedicated trading desk", "API integration"],
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-card border-border relative ${plan.popular ? "border-primary ring-1 ring-primary/30" : ""}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg font-display font-bold text-foreground text-center mb-2">{plan.name}</h3>
                <p className="text-3xl font-display font-bold text-gradient-brand text-center my-3">{plan.expectedReturn}</p>
                <p className="text-xs text-muted-foreground text-center mb-1">Expected Return</p>
                <div className="border-t border-border my-4 pt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Min. Investment: <span className="text-foreground font-medium">{plan.minInvestment}</span></p>
                  <p>Duration: <span className="text-foreground font-medium">{plan.duration}</span></p>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.popular ? "bg-gradient-brand text-primary-foreground font-semibold" : ""}`} variant={plan.popular ? "default" : "outline"} asChild>
                  <Link to="/register">Invest Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Why Invest With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {benefits.map((b) => (
            <Card key={b.title} className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <b.icon className="h-8 w-8 text-primary mx-auto mb-3" />
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
