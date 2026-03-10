import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, TrendingUp, MapPin, DollarSign } from "lucide-react";

const properties = [
  { name: "Manhattan Office Tower", type: "Commercial", location: "New York, USA", minInvest: "$5,000", returns: "8-12%", status: "Open" },
  { name: "London Residential Complex", type: "Residential", location: "London, UK", minInvest: "$2,500", returns: "6-9%", status: "Open" },
  { name: "Dubai Marina Apartments", type: "Tokenized", location: "Dubai, UAE", minInvest: "$1,000", returns: "10-15%", status: "Open" },
  { name: "Singapore Tech Park", type: "Commercial", location: "Singapore", minInvest: "$10,000", returns: "7-11%", status: "Open" },
  { name: "Tokyo Residential REIT", type: "REIT", location: "Tokyo, Japan", minInvest: "$500", returns: "5-8%", status: "Open" },
  { name: "Sydney Harbour Complex", type: "Development", location: "Sydney, AU", minInvest: "$3,000", returns: "12-18%", status: "Filling" },
  { name: "US Real Estate REIT", type: "REIT", location: "United States", minInvest: "$250", returns: "4-7%", status: "Open" },
  { name: "Berlin Mixed-Use Project", type: "Development", location: "Berlin, DE", minInvest: "$5,000", returns: "9-14%", status: "Open" },
];

const MarketRealEstate = () => (
  <StaticPageLayout>
    <SEO title="Real Estate Investing | Vertex Global Markets" description="Invest in 140+ global real estate opportunities through REITs, tokenized assets, and development projects." path="/markets/real-estate" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-5xl mb-4">🏢</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Real Estate <span className="text-gradient-brand">Investing</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Invest in global real estate through REITs, tokenized assets, and development projects — starting from $250.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Properties", value: "140+" },
            { label: "Countries", value: "25+" },
            { label: "Avg Returns", value: "6-15%" },
            { label: "Min Investment", value: "$250" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
              <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {properties.map((p) => (
            <Card key={p.name} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">{p.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.status === "Open" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  }`}>{p.status}</span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.location}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-3 w-3" /> Min: {p.minInvest}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-3 w-3" /> Est. Returns: {p.returns}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{p.type}</span>
                  <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
                    <Link to="/register">Invest Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Start Investing in Real Estate</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default MarketRealEstate;
