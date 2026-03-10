import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Server, Key, AlertTriangle } from "lucide-react";

const features = [
  { icon: Lock, title: "End-to-End Encryption", description: "All data is encrypted with AES-256 at rest and TLS 1.3 in transit. Your credentials, documents, and financial data are never stored in plain text." },
  { icon: Shield, title: "Two-Factor Authentication", description: "Protect your account with TOTP-based 2FA. Even if your password is compromised, your account remains secure with a second authentication factor." },
  { icon: Server, title: "Segregated Fund Storage", description: "Client funds are held in segregated accounts at tier-1 banks in multiple jurisdictions, completely separate from our corporate funds." },
  { icon: Eye, title: "Real-Time Monitoring", description: "Our security operations center monitors platform activity 24/7, using AI-powered anomaly detection to identify and block suspicious behavior instantly." },
  { icon: Key, title: "Cold Storage for Crypto", description: "95% of cryptocurrency holdings are stored in air-gapped cold wallets with multi-signature authorization requiring 3-of-5 key holders." },
  { icon: AlertTriangle, title: "Bug Bounty Program", description: "We maintain an active bug bounty program rewarding security researchers who responsibly disclose vulnerabilities. Report issues to security@vertexglobal.com." },
];

const Security = () => (
  <StaticPageLayout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            <span className="text-gradient-brand">Security</span> at Vertex
          </h1>
          <p className="text-lg text-muted-foreground">
            Your security is our top priority. We employ institutional-grade infrastructure and practices to protect your assets and data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <Card key={f.title} className="bg-card border-border">
              <CardContent className="p-6">
                <f.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
            <h3 className="font-display font-semibold text-foreground mb-2">Report a Security Issue</h3>
            <p className="text-sm text-muted-foreground">
              If you discover a security vulnerability, please report it responsibly to{" "}
              <a href="mailto:security@vertexglobal.com" className="text-primary underline">security@vertexglobal.com</a>.
              We take all reports seriously and respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Security;
