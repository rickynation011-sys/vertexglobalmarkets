import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Target, Users, Globe, Award, TrendingUp } from "lucide-react";
import teamAlexander from "@/assets/team-alexander.jpg";
import teamSarah from "@/assets/team-sarah.jpg";
import teamMarcus from "@/assets/team-marcus.jpg";
import teamElena from "@/assets/team-elena.jpg";

const values = [
  { icon: Shield, title: "Security First", description: "Your funds are segregated in tier-1 banks with institutional-grade encryption protecting every transaction." },
  { icon: Target, title: "Innovation", description: "We push boundaries with AI-driven trading tools, real-time analytics, and cutting-edge execution technology." },
  { icon: Users, title: "Client Focus", description: "Every decision we make starts with our clients. 24/7 support, transparent pricing, and personalized solutions." },
  { icon: Globe, title: "Global Reach", description: "Operating in 180+ countries with localized support, multi-currency accounts, and regional compliance." },
  { icon: Award, title: "Excellence", description: "Award-winning platform recognized for innovation, user experience, and regulatory compliance." },
  { icon: TrendingUp, title: "Transparency", description: "No hidden fees, no conflicts of interest. We succeed when our clients succeed." },
];

const team = [
  { name: "Alexander Wright", role: "CEO & Founder", bio: "Former Goldman Sachs VP with 20+ years in global financial markets.", photo: teamAlexander },
  { name: "Dr. Sarah Chen", role: "Chief Technology Officer", bio: "PhD in Machine Learning from MIT. Previously led AI research at a major hedge fund.", photo: teamSarah },
  { name: "Marcus Johnson", role: "Chief Financial Officer", bio: "Chartered accountant with experience at Deloitte and HSBC.", photo: teamMarcus },
  { name: "Elena Rodriguez", role: "Head of Compliance", bio: "Former regulator with 15 years ensuring financial market integrity.", photo: teamElena },
];

const About = () => (
  <StaticPageLayout>
    <SEO title="About Us" description="Founded in 2020, Vertex Global Markets serves 500K+ traders in 180+ countries with AI-powered trading technology." path="/about" />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            About <span className="text-gradient-brand">Vertex</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Founded in 2020, Vertex Global Markets is redefining how the world trades and invests through
            artificial intelligence, institutional-grade infrastructure, and a relentless focus on the trader.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { stat: "500K+", label: "Active Traders" },
            { stat: "$12B+", label: "Monthly Volume" },
            { stat: "180+", label: "Countries Served" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-display font-bold text-gradient-brand">{s.stat}</p>
              <p className="text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {values.map((v) => (
            <Card key={v.title} className="bg-card border-border">
              <CardContent className="p-6">
                <v.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((t) => (
            <Card key={t.name} className="bg-card border-border text-center">
              <CardContent className="p-6">
                <img src={t.photo} alt={t.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-primary/20" />
                <h3 className="font-display font-semibold text-foreground">{t.name}</h3>
                <p className="text-xs text-primary mb-2">{t.role}</p>
                <p className="text-xs text-muted-foreground">{t.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default About;
