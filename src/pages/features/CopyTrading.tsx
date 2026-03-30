import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Copy, Shield, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const highlights = [
  { icon: Zap, title: "Automatic Replication", desc: "Trades are mirrored instantly when your chosen trader executes." },
  { icon: Shield, title: "Risk Controls", desc: "Set allocation limits and stop-loss to manage your exposure." },
  { icon: TrendingUp, title: "Proven Traders", desc: "Browse verified traders with transparent performance histories." },
];

const CopyTrading = () => (
  <StaticPageLayout>
    <SEO title="Copy Trading" description="Automatically replicate strategies of successful traders on Vertex Global Markets." path="/features/copy-trading" />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Copy className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Copy Trading</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl">
          Automatically replicate strategies of successful traders. Select a trader, set your allocation, and let the platform mirror their moves in real time.
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
        <div className="text-center">
          <Button className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Start Copy Trading</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default CopyTrading;
