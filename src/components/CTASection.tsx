import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(145_60%_45%/0.1),transparent_60%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-card border border-border shadow-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Start <span className="text-gradient-brand">Investing?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Create your free account in minutes. Access AI-powered trading, multi-asset portfolios, and institutional-grade tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground font-semibold text-base px-8" asChild>
              <Link to="/register">
                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Trading involves risk. Estimated returns are not guaranteed. Past performance does not guarantee future results.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
