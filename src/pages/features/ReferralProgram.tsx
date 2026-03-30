import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Users, Gift, Share2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const highlights = [
  { icon: Share2, title: "Easy Sharing", desc: "Get a unique referral link to share with friends and family." },
  { icon: Gift, title: "Earn Bonuses", desc: "Receive rewards when your referrals sign up and start trading." },
  { icon: TrendingUp, title: "Multi-Level Rewards", desc: "Benefit from multiple levels of referral commissions." },
];

const ReferralProgram = () => (
  <StaticPageLayout>
    <SEO title="Referral Program" description="Earn bonuses by inviting friends to join Vertex Global Markets." path="/features/referral-program" />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Referral Program</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl">
          Earn bonuses by inviting friends to join the platform. Share your unique referral link and get rewarded when they sign up and start trading.
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
            <Link to="/register">Join & Start Earning</Link>
          </Button>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default ReferralProgram;
