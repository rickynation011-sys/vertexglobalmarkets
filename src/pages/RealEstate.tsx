import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Building2, MapPin, TrendingUp, Shield, Globe, BarChart3, CheckCircle } from "lucide-react";

const propertyTypes = [
  { icon: Building2, title: "Commercial Real Estate", description: "Invest in office buildings, retail spaces, and mixed-use developments across major global cities.", examples: ["Office Towers", "Retail Centers", "Mixed-Use"] },
  { icon: MapPin, title: "Residential Properties", description: "Access premium residential developments in high-growth markets with strong rental yields.", examples: ["Luxury Apartments", "Student Housing", "Build-to-Rent"] },
  { icon: Globe, title: "International REITs", description: "Diversify globally with Real Estate Investment Trusts spanning multiple countries and sectors.", examples: ["US REITs", "European REITs", "Asia-Pacific REITs"] },
  { icon: BarChart3, title: "Real Estate Debt", description: "Earn fixed income through real estate-backed loans and mortgage securities with predictable returns.", examples: ["Senior Debt", "Mezzanine Finance", "Mortgage Bonds"] },
  { icon: TrendingUp, title: "Development Projects", description: "Participate in ground-up developments with higher return potential through our vetted project pipeline.", examples: ["Pre-Construction", "Value-Add", "Ground-Up"] },
  { icon: Shield, title: "Tokenized Real Estate", description: "Fractional ownership of premium properties through blockchain-based tokenization, starting from $100.", examples: ["Fractional Shares", "Property Tokens", "NFT Deeds"] },
];

const plans = [
  { name: "Starter", minInvestment: "$500", expectedReturn: "6-8%", duration: "12 months", features: ["REIT portfolio access", "Monthly dividends", "Auto-reinvest option", "Quarterly reports"] },
  { name: "Growth", minInvestment: "$5,000", expectedReturn: "10-14%", duration: "24 months", features: ["Direct property investment", "Diversified portfolio", "Tax optimization", "Priority access to deals", "Dedicated advisor"], popular: true },
  { name: "Premium", minInvestment: "$25,000", expectedReturn: "15-22%", duration: "36 months", features: ["Development project access", "Co-investment opportunities", "Custom portfolio construction", "On-site property tours", "VIP investor events", "Legal & tax support"] },
];

const stats = [
  { value: "$1.8B", label: "Real Estate AUM" },
  { value: "142", label: "Properties Funded" },
  { value: "11.3%", label: "Avg. Annual Return*" },
  { value: "15K+", label: "Property Investors" },
];

const RealEstate = () => (
  <StaticPageLayout>
    <SEO title="Real Estate Investments" description="Invest in global real estate with fractional ownership, REITs, and development projects. Returns up to 22% annually on Vertex Global Markets." path="/real-estate" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Building2 className="h-3 w-3 mr-1" /> New Asset Class
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Real Estate <span className="text-gradient-brand">Investments</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Access institutional-grade real estate investments from $500. Earn passive income through rental yields, capital appreciation, and development returns.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-display font-bold text-gradient-brand">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Investment Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {propertyTypes.map((p) => (
            <Card key={p.title} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <p.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  {p.examples.map((e) => (
                    <span key={e} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">{e}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Investment Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-card border-border relative ${plan.popular ? "border-primary ring-1 ring-primary/30" : ""}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
              )}
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-display font-bold text-foreground">{plan.name}</h3>
                <p className="text-3xl font-display font-bold text-gradient-brand my-4">{plan.expectedReturn}</p>
                <p className="text-xs text-muted-foreground mb-1">Expected Annual Return</p>
                <div className="border-t border-border my-4 pt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Min. Investment: <span className="text-foreground font-medium">{plan.minInvestment}</span></p>
                  <p>Lock-up: <span className="text-foreground font-medium">{plan.duration}</span></p>
                </div>
                <ul className="space-y-2 mb-6 text-left">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.popular ? "bg-gradient-brand text-primary-foreground font-semibold" : ""}`} variant={plan.popular ? "default" : "outline"} asChild>
                  <Link to="/register">Start Investing</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-muted-foreground">
              *Real estate investments are subject to market risk. Please read our <Link to="/risk-disclosure" className="text-primary underline">Risk Disclosure</Link> before investing.
            </p>
          </div>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default RealEstate;
