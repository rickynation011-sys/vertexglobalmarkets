import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SoftCTASection = () => {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Get Started at Your Own Pace
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Joining Vertex Global Markets is simple and flexible.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          You are free to explore the platform, understand how it works, and decide what suits you best. There is no pressure — just an opportunity to experience a different approach to trading.
        </p>
        <Button
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10"
          asChild
        >
          <Link to="/register">Create Free Account</Link>
        </Button>
      </div>
    </section>
  );
};

export default SoftCTASection;
