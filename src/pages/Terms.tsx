import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";

const Terms = () => (
  <StaticPageLayout>
    <SEO title="Terms of Service" description="Terms and conditions for using the Vertex Global Markets trading platform." path="/terms" />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Vertex Global Markets platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform. These Terms constitute a legally binding agreement between you and Vertex Global Markets Ltd.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years old and legally permitted to trade financial instruments in your jurisdiction. By creating an account, you represent that you meet these requirements and that all information provided is accurate and complete.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">3. Account Registration</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must complete identity verification (KYC) before accessing certain features including deposits, withdrawals, and trading. We reserve the right to refuse or terminate accounts at our discretion.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">4. Trading & Investment Risks</h2>
            <p>Trading financial instruments, including forex, cryptocurrencies, and CFDs, involves substantial risk of loss. Leveraged products can result in losses exceeding your initial deposit. Past performance does not guarantee future results. You should not invest money you cannot afford to lose.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">5. Fees & Charges</h2>
            <p>All applicable fees, spreads, commissions, and overnight financing charges are disclosed on our pricing page. We reserve the right to modify our fee structure with 30 days advance notice. Withdrawal fees may apply depending on the payment method and amount.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">6. Prohibited Activities</h2>
            <p>You may not use the Platform for money laundering, fraud, market manipulation, or any illegal activity. Automated trading systems that exploit platform vulnerabilities are prohibited. We monitor trading activity and reserve the right to close positions and freeze accounts suspected of abusive behavior.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">7. Intellectual Property</h2>
            <p>All content, software, and materials on the Platform are owned by Vertex Global Markets and protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the Platform without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Vertex Global Markets shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to trading losses, system downtime, or data breaches.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">9. Governing Law</h2>
            <p>These Terms are governed by the laws of England and Wales. Any disputes shall be resolved through binding arbitration in London, United Kingdom, unless otherwise required by applicable consumer protection laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">10. Contact</h2>
            <p>For questions regarding these Terms, please contact our legal department at legal@vertexglobal.com.</p>
          </section>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Terms;
