import { Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ContactSupportSection = () => {
  return (
    <section className="py-16 sm:py-20 bg-card/30 border-t border-border">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Contact & Support
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Our support team is available to assist users with any questions regarding their accounts or platform usage.
        </p>
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-lg px-5 py-3 mb-4">
          <Mail className="h-5 w-5 text-primary" />
          <a
            href="mailto:support@vertexglobalmarkets.com"
            className="text-primary font-semibold hover:underline"
          >
            support@vertexglobalmarkets.com
          </a>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          We aim to respond to all inquiries as quickly as possible.
        </p>
        <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" asChild>
          <Link to="/contact">Visit Contact Page</Link>
        </Button>
      </div>
    </section>
  );
};

export default ContactSupportSection;
