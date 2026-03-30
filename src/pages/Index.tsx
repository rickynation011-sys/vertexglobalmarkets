import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarketTicker from "@/components/MarketTicker";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import MarketsOverview from "@/components/MarketsOverview";
import AutoTradingSection from "@/components/AutoTradingSection";
import CopyTradingSection from "@/components/CopyTradingSection";
import TopTradersSection from "@/components/TopTradersSection";
import InvestorsLeaderboard from "@/components/InvestorsLeaderboard";
import ExtendedTestimonials from "@/components/ExtendedTestimonials";
import SecuritySection from "@/components/SecuritySection";
import PlatformFeaturesSection from "@/components/PlatformFeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import TrustIndicators from "@/components/TrustIndicators";
import TransparencySection from "@/components/TransparencySection";
import HowItWorksSection from "@/components/HowItWorksSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LiveActivityFeed />
      <SEO
        title="Global Trading & Investment Platform"
        description="Trade forex, crypto, stocks, commodities and more with advanced strategies and professional-grade tools. Join 500K+ traders on Vertex Global Markets."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Vertex Global Markets",
          url: "https://vertexglobalmarkets.com",
          description: "Advanced trading and investment platform for forex, crypto, stocks, and commodities.",
          foundingDate: "2020",
          numberOfEmployees: { "@type": "QuantitativeValue", value: 200 },
        }}
      />
      <Navbar />
      <HeroSection />
      <MarketTicker />
      <TrustIndicators />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MarketsOverview />
      <AutoTradingSection />
      <CopyTradingSection />
      <TopTradersSection />
      <InvestorsLeaderboard />
      <SecuritySection />
      <PlatformFeaturesSection />
      <TransparencySection />
      <TestimonialsSection />
      <ExtendedTestimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
