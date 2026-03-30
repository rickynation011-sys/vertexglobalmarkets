import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { LineChart, Clock, Layers, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const highlights = [
  { icon: Clock, title: "Multiple Timeframes", desc: "Analyze markets across 1-minute to monthly timeframes." },
  { icon: Layers, title: "Technical Indicators", desc: "RSI, MACD, Bollinger Bands, and more built right in." },
  { icon: BarChart3, title: "Professional Tools", desc: "Drawing tools, trend lines, and Fibonacci retracements." },
];

const LiveCharts = () => (
  <StaticPageLayout>
    <SEO title="Live Market Charts" description="Professional-grade charting with multiple timeframes and technical indicators." path="/features/live-charts" />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <LineChart className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Live Market Charts</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl">
          Professional-grade charting with real-time data, multiple timeframes, and a full suite of technical indicators to help you make informed trading decisions.
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
            <Link to="/register">Explore Charts</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default LiveCharts;
