import { ShieldCheck } from "lucide-react";

const TransparencySection = () => {
  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <div className="flex justify-center mb-4">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
          Transparency &amp; User Awareness
        </h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          At Vertex Global Markets, we believe in clarity and informed decision-making.
        </p>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Trading financial markets involves risk, and outcomes may vary depending on market conditions. While our system is designed to identify opportunities, results are not guaranteed.
        </p>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          We encourage all users to:
        </p>
        <ul className="text-muted-foreground space-y-2 mb-6 inline-block text-left">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            Start with an amount they are comfortable with
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            Monitor their account regularly
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            Make informed decisions at their own pace
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Our goal is to provide tools and access while users remain in full control of their participation.
        </p>
      </div>
    </section>
  );
};

export default TransparencySection;
