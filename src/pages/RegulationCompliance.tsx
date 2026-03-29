import StaticPageLayout from "@/layouts/StaticPageLayout";
import SEO from "@/components/SEO";

const RegulationCompliance = () => {
  return (
    <StaticPageLayout>
      <SEO
        title="Regulation and Compliance"
        description="Learn about Vertex Global Markets' commitment to transparency, operational integrity, and user security in digital asset trading."
        path="/regulation-compliance"
      />
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12">
          Regulation and Compliance
        </h1>

        <div className="space-y-10 text-muted-foreground leading-relaxed">
          <p>
            Vexter Global Markets operates within the digital asset and automated trading sector.
          </p>
          <p>
            Our services are centered on technology-driven trading solutions and access to global digital markets. As such, our operations differ from traditional financial institutions such as stock brokerage firms, which are typically overseen by regulatory bodies like the U.S. Securities and Exchange Commission (SEC), the Financial Industry Regulatory Authority (FINRA), and the Financial Conduct Authority (FCA).
          </p>
          <p>
            We are committed to maintaining high standards of transparency, operational integrity, and user security across our platform.
          </p>

          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground pt-4">
            Risk Disclosure
          </h2>
          <p>Trading involves risk.</p>
          <p>
            Digital asset markets are highly volatile, and while our system is designed to identify trading opportunities, estimates are based on historical performance. Users may experience losses depending on market conditions.
          </p>
          <p>
            By using this platform, you acknowledge and accept the risks involved.
          </p>

          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground pt-4">
            Business Model
          </h2>
          <p>
            Vexter Global Markets provides automated trading solutions, access to digital asset markets, and technology-driven trading systems.
          </p>
          <p>
            We focus on delivering tools and systems that assist users in participating in the market efficiently.
          </p>

          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground pt-4">
            Transparency Commitment
          </h2>
          <p>
            Vexter Global Markets is committed to providing clear and honest information about how the platform operates.
          </p>
          <p>
            We prioritize user security, system monitoring, and consistent performance while maintaining transparency in our services.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default RegulationCompliance;
