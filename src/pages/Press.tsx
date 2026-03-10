import StaticPageLayout from "@/layouts/StaticPageLayout";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink } from "lucide-react";

const pressItems = [
  {
    date: "February 2026",
    title: "Vertex Global Markets Expands Multi-Asset Trading Platform",
    source: "Financial Times",
    summary: "Vertex Global Markets announces the expansion of its trading platform to include over 500 instruments across forex, crypto, stocks, and commodities.",
  },
  {
    date: "January 2026",
    title: "Vertex Global Markets Achieves Regulatory Milestone",
    source: "Bloomberg",
    summary: "The company secures additional regulatory approvals, strengthening its position as a trusted global trading platform.",
  },
  {
    date: "December 2025",
    title: "Vertex Launches AI-Powered Trading Analytics",
    source: "TechCrunch",
    summary: "New AI-driven analytics tools give retail traders access to institutional-grade market insights and automated trading strategies.",
  },
  {
    date: "November 2025",
    title: "Vertex Global Markets Surpasses 500,000 Active Traders",
    source: "Reuters",
    summary: "The platform reaches a major milestone in user growth, driven by competitive spreads and an intuitive trading experience.",
  },
];

const Press = () => {
  return (
    <StaticPageLayout>
      <SEO
        title="Press & Media"
        description="Latest news, press releases, and media coverage about Vertex Global Markets. Stay updated on our growth and innovations."
        path="/press"
      />

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              <Newspaper className="h-3 w-3 mr-1" /> Press & Media
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              In the <span className="text-gradient-brand">News</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Latest press releases and media coverage about Vertex Global Markets.
            </p>
          </div>

          <div className="space-y-6">
            {pressItems.map((item, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                        <Badge variant="secondary" className="text-xs">{item.source}</Badge>
                      </div>
                      <h2 className="text-lg font-display font-semibold text-foreground">{item.title}</h2>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-muted/30 border-border">
              <CardContent className="p-8">
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">Media Inquiries</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  For press and media inquiries, please contact our communications team.
                </p>
                <a href="mailto:press@vertexglobalmarkets.com" className="text-sm text-primary hover:underline">
                  press@vertexglobalmarkets.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default Press;
