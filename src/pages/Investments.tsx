import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PieChart, TrendingUp, Shield, BarChart3, Users, Wallet } from "lucide-react";

const strategies = [
  { icon: PieChart, title: "Managed Portfolios", description: "Let our AI and expert analysts manage diversified portfolios tailored to your risk profile and financial goals." },
  { icon: TrendingUp, title: "Copy Trading", description: "Automatically replicate the trades of top-performing traders. Choose from hundreds of verified strategy providers." },
  { icon: Shield, title: "Fixed-Income Plans", description: "Earn predictable returns with structured investment plans backed by institutional trading strategies." },
  { icon: BarChart3, title: "Thematic Investing", description: "Invest in curated baskets around themes like AI, clean energy, DeFi, and emerging markets." },
  { icon: Users, title: "Social Trading", description: "Follow expert traders, share strategies, and discuss market movements with a global community of investors." },
  { icon: Wallet, title: "Crypto Staking", description: "Earn passive yield on your crypto holdings through secure staking pools with flexible lock-up periods." },
];

const stats = [
  { value: "12.4%", label: "Avg. Annual Return*" },
  { value: "$2.1B", label: "Assets Under Management" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50K+", label: "Active Investors" },
];

const Investments = () => (
  <StaticPageLayout>
    <SEO title="Investments" description="Grow your wealth with managed portfolios, copy trading, staking, and structured investment plans on Vertex Global Markets." path="/investments" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Smart <span className="text-gradient-brand">Investments</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Whether you're a hands-on trader or prefer a passive approach, we offer investment solutions for every style.
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {strategies.map((s) => (
            <Card key={s.title} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <s.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Start Investing</Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">*Past performance does not guarantee future results. Capital at risk.</p>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Investments;
