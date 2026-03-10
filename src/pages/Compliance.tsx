import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";

const Compliance = () => (
  <StaticPageLayout>
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Compliance</h1>
        <p className="text-sm text-muted-foreground mb-10">Our commitment to regulatory standards</p>

        <div className="prose prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Regulatory Framework</h2>
            <p>Vertex Global Markets operates under strict regulatory oversight. We comply with international financial regulations and maintain the highest standards of transparency, client fund protection, and fair trading practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Anti-Money Laundering (AML)</h2>
            <p>We maintain a comprehensive AML program that includes customer due diligence (CDD), enhanced due diligence (EDD) for high-risk clients, ongoing transaction monitoring, suspicious activity reporting (SAR), and employee training on AML procedures.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Know Your Customer (KYC)</h2>
            <p>All clients must complete identity verification before accessing trading and withdrawal features. This includes government-issued photo ID, proof of address (dated within 3 months), and selfie verification. Enhanced verification may be required for higher trading volumes.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Client Fund Protection</h2>
            <p>Client funds are held in segregated accounts at tier-1 banks, completely separate from our operational funds. In the unlikely event of insolvency, client funds are protected and will be returned to clients.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Data Protection</h2>
            <p>We comply with GDPR, CCPA, and other applicable data protection regulations. All personal data is processed lawfully, stored securely, and retained only for as long as necessary. See our Privacy Policy for full details.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Conflict of Interest Policy</h2>
            <p>We maintain clear policies to identify, prevent, and manage conflicts of interest. Our execution model ensures client orders are filled at the best available price without interference.</p>
          </section>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Compliance;
