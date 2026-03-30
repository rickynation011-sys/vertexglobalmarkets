import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Calculator, PieChart, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const highlights = [
  { icon: DollarSign, title: "Return Estimates", desc: "See projected returns based on your chosen plan and amount." },
  { icon: Clock, title: "Duration Planning", desc: "Compare results across different investment timeframes." },
  { icon: PieChart, title: "Visual Breakdown", desc: "Understand your potential earnings with clear visual charts." },
];

const InvestmentCalculator = () => (
  <StaticPageLayout>
    <SEO title="Investment Calculator" description="Plan your investments with our returns forecasting tool on Vertex Global Markets." path="/features/investment-calculator" />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Investment Calculator</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl">
          Plan your investments with our returns forecasting tool. Enter your amount and duration to see estimated outcomes before you commit.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {highlights.map((h) => (
            <Card key={h.title} className="rounded-2xl border-border bg-card hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <h.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{h.title}</h3>
                <p className="text-sm text-muted-foreground">{h.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mb-6 italic">All estimates are based on market conditions and are not guaranteed.</p>
        <div className="text-center">
          <Button className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Try the Calculator</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default InvestmentCalculator;
