import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";

const RiskDisclosure = () => (
  <StaticPageLayout>
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Risk Disclosure</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-10">
          <p className="text-sm text-destructive font-medium">
            ⚠️ Trading financial instruments carries a high level of risk and may not be suitable for all investors. You could lose more than your initial investment.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Market Risk</h2>
            <p>Financial markets are inherently volatile. Prices of forex, cryptocurrencies, commodities, and other instruments can fluctuate rapidly due to economic events, geopolitical developments, natural disasters, and market sentiment. These movements can result in significant gains or losses.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Leverage Risk</h2>
            <p>Leveraged trading allows you to control larger positions with a smaller deposit. While this amplifies potential profits, it equally amplifies potential losses. A small adverse market movement can result in losses exceeding your initial margin deposit, and you may be required to deposit additional funds at short notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Cryptocurrency Risk</h2>
            <p>Cryptocurrencies are extremely volatile and largely unregulated. They are susceptible to hacking, regulatory changes, technology failures, and market manipulation. The value of cryptocurrency holdings can drop to zero.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">AI & Automated Trading Risk</h2>
            <p>AI-generated signals and automated trading systems are based on historical data and algorithms. They do not guarantee future performance. Technical failures, model errors, and unprecedented market conditions can lead to unexpected losses.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Liquidity Risk</h2>
            <p>Certain instruments may experience reduced liquidity during off-market hours, major news events, or extreme market conditions. This can result in wider spreads, slippage, and difficulty executing trades at desired prices.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Recommendation</h2>
            <p>Before trading, ensure you fully understand the risks involved. Only invest funds you can afford to lose. Consider seeking independent financial advice. Use risk management tools such as stop-losses and take-profits. Regularly review and adjust your trading strategy.</p>
          </section>
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default RiskDisclosure;
