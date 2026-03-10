import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";

const Privacy = () => (
  <StaticPageLayout>
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect personal information you provide during registration (name, email, phone, address), identity verification documents, financial information (payment methods, transaction history), and technical data (IP address, device info, browser type, usage analytics).</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to: provide and improve our services, verify your identity (KYC/AML compliance), process transactions, send account notifications, detect fraud and prevent money laundering, personalize your trading experience, and comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share information with: regulated payment processors for transaction processing, identity verification providers, regulatory authorities when legally required, and service providers who assist in platform operations under strict data protection agreements.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including AES-256 encryption, TLS 1.3 for data in transit, multi-factor authentication, regular security audits, and intrusion detection systems. Despite these measures, no system is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active and for a minimum of 5 years after closure to comply with anti-money laundering regulations. You may request deletion of non-essential data at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>Under GDPR and applicable data protection laws, you have the right to: access your personal data, rectify inaccuracies, request deletion, restrict processing, data portability, and object to processing. To exercise these rights, contact privacy@vertexglobal.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">7. Cookies</h2>
            <p>We use essential cookies for platform functionality, analytics cookies to improve our service, and preference cookies to remember your settings. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">8. Contact</h2>
            <p>For privacy-related inquiries, contact our Data Protection Officer at privacy@vertexglobal.com.</p>
          </section>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Privacy;
