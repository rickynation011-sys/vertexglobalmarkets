import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import FloatingChatButtons from "@/components/FloatingChatButtons";
import HeroSection from "@/components/HeroSection";
import MarketTicker from "@/components/MarketTicker";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import MarketsOverview from "@/components/MarketsOverview";
import AutoTradingSection from "@/components/AutoTradingSection";
import CopyTradingSection from "@/components/CopyTradingSection";
import SecuritySection from "@/components/SecuritySection";
import PlatformFeaturesSection from "@/components/PlatformFeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import TrustIndicators from "@/components/TrustIndicators";
import TransparencySection from "@/components/TransparencySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ContactSupportSection from "@/components/ContactSupportSection";
import SoftCTASection from "@/components/SoftCTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LiveActivityFeed />
      <SEO
        title="Secure Trading & Investment Platform"
        description="Trade forex, crypto, stocks, commodities and more with professional-grade tools and risk management. Vertex Global Markets — Secure Trading Platform."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Vertex Global Markets",
          url: "https://vertexglobalmarkets.com",
          description: "Multi-asset trading and investment platform for forex, crypto, stocks, and commodities.",
        }}
      />
      <AnnouncementBanner />
      <Navbar />
      <HeroSection />
      <FloatingChatButtons />
      <MarketTicker />
      <TrustIndicators />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MarketsOverview />
      <AutoTradingSection />
      <CopyTradingSection />
      <SecuritySection />
      <PlatformFeaturesSection />
      <TransparencySection />
      <TestimonialsSection />
      <ContactSupportSection />
      <SoftCTASection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
