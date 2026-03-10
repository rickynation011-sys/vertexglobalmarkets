import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarketTicker from "@/components/MarketTicker";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import MarketsOverview from "@/components/MarketsOverview";
import AutoTradingSection from "@/components/AutoTradingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI-Powered Trading & Investment Platform"
        description="Trade forex, crypto, stocks, commodities and more with AI-driven automation. Join 500K+ traders on Vertex Global Markets."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Vertex Global Markets",
          url: "https://vertexglobalmarkets.com",
          description: "AI-powered automated trading and investment platform for forex, crypto, stocks, and commodities.",
          foundingDate: "2020",
          numberOfEmployees: { "@type": "QuantitativeValue", value: 200 },
        }}
      />
      <Navbar />
      <HeroSection />
      <MarketTicker />
      <StatsSection />
      <FeaturesSection />
      <MarketsOverview />
      <AutoTradingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
