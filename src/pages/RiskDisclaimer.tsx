import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { AlertTriangle } from "lucide-react";

const RiskDisclaimer = () => (
  <StaticPageLayout>
    <SEO
      title="Risk Disclaimer"
      description="Risk disclaimer for Vertex Global Markets. Understand the risks involved in trading financial instruments."
      path="/risk-disclaimer"
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Risk Disclaimer</h1>
            <p className="text-sm text-muted-foreground">Last updated: March 30, 2026</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-10">
          <p className="text-sm text-destructive font-medium">
            ⚠️ Please read this disclaimer carefully before using the platform.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">General Risk Warning</h2>
            <p>
              Trading involves risk and may not be suitable for everyone. There is a possibility of partial or full loss of funds depending on market conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">No Guarantee of Profits</h2>
            <p>
              Vertex Global Markets does not guarantee profits, and past performance does not assure future results. All estimated returns presented on this platform are based on historical data and prevailing market conditions, and actual outcomes may differ.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">User Responsibility</h2>
            <p>
              By using this platform, users acknowledge and accept the risks involved. Users are encouraged to:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Start with an amount they are comfortable with</li>
              <li>Monitor their account regularly</li>
              <li>Make informed decisions at their own pace</li>
              <li>Seek independent financial advice if needed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Market Volatility</h2>
            <p>
              Financial markets are subject to rapid price movements caused by economic events, geopolitical developments, and other factors beyond our control. Users should be aware that the value of their investments can go down as well as up.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Acceptance of Terms</h2>
            <p>
              By creating an account and using any services provided by Vertex Global Markets, you confirm that you have read, understood, and accepted this Risk Disclaimer in full.
            </p>
          </section>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default RiskDisclaimer;
