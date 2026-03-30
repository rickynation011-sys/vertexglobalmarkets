import { UserPlus, Wallet, BarChart3, Eye } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create Your Account", description: "Sign up in minutes with a simple registration process." },
  { icon: Wallet, title: "Fund Your Wallet", description: "Deposit your preferred amount using supported methods." },
  { icon: BarChart3, title: "System-Assisted Trading", description: "The platform assists with trading activity on your behalf." },
  { icon: Eye, title: "Monitor Performance", description: "Track your account performance anytime, anywhere." },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-foreground">
          How It Works
        </h2>
        <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto leading-relaxed">
          Vertex Global Markets is designed to simplify access to online trading through a structured and user-friendly experience.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-5 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-primary mb-1">Step {i + 1}</span>
              <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-center mt-8 leading-relaxed">
          The platform is built to provide a smooth experience while allowing users to stay in full control.
        </p>
      </div>
    </section>
  );
};

export default HowItWorksSection;
