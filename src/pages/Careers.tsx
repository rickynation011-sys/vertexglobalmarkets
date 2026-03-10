import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";

const openings = [
  { title: "Senior Backend Engineer", dept: "Engineering", location: "Remote", type: "Full-time", description: "Build scalable microservices powering our trading infrastructure." },
  { title: "AI/ML Engineer", dept: "Engineering", location: "London, UK", type: "Full-time", description: "Develop predictive models for market analysis and automated trading signals." },
  { title: "Product Designer", dept: "Design", location: "Remote", type: "Full-time", description: "Shape the user experience of our web and mobile trading platforms." },
  { title: "Compliance Officer", dept: "Legal", location: "Dubai, UAE", type: "Full-time", description: "Ensure regulatory compliance across multiple jurisdictions." },
  { title: "Customer Success Manager", dept: "Support", location: "Singapore", type: "Full-time", description: "Onboard and support high-value clients across the APAC region." },
  { title: "Quantitative Analyst", dept: "Trading", location: "New York, US", type: "Full-time", description: "Research and implement quantitative trading strategies." },
];

const perks = [
  "Competitive salary + equity", "Remote-first culture", "Unlimited PTO",
  "Health & dental insurance", "Learning budget ($5K/year)", "Annual team retreats",
  "Home office stipend", "Crypto-friendly payroll",
];

const Careers = () => (
  <StaticPageLayout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Join <span className="text-gradient-brand">Our Team</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Help us build the future of trading. We're looking for exceptional people who thrive on solving complex problems at global scale.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {perks.map((perk) => (
            <span key={perk} className="px-4 py-2 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">{perk}</span>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground mb-8">Open Positions</h2>
        <div className="space-y-4">
          {openings.map((job) => (
            <Card key={job.title} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Briefcase className="h-3 w-3" /> {job.dept}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {job.location}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {job.type}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1 shrink-0">Apply <ArrowRight className="h-3 w-3" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Careers;
