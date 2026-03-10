import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setSending(false);
    }, 1000);
  };

  return (
    <StaticPageLayout>
      <SEO title="Contact Us" description="Get in touch with Vertex Global Markets. 24/7 support via email, phone, and live chat." path="/contact" />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Contact <span className="text-gradient-brand">Us</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a question? Our support team is available 24/7 to help you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Full Name</label>
                        <Input placeholder="John Doe" required className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Email</label>
                        <Input type="email" placeholder="john@example.com" required className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Subject</label>
                      <Input placeholder="How can we help?" required className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Message</label>
                      <Textarea placeholder="Tell us more about your inquiry..." rows={5} required className="mt-1" />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground font-semibold" disabled={sending}>
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail, title: "Email", value: "support@vertexglobal.com" },
                { icon: Phone, title: "Phone", value: "+1 (800) 555-0199" },
                { icon: MessageSquare, title: "Live Chat", value: "Available 24/7 on platform" },
                { icon: MapPin, title: "Office", value: "Level 42, One Canada Square, London E14 5AB" },
                { icon: Clock, title: "Business Hours", value: "Markets: 24/5 | Support: 24/7" },
              ].map((item) => (
                <Card key={item.title} className="bg-card border-border">
                  <CardContent className="p-4 flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default Contact;
