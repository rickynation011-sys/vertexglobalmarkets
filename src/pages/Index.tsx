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
