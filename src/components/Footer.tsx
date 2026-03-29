import { Link } from "react-router-dom";
import logo from "@/assets/logo-symbol.png";

const footerLinks = {
  Platform: [
    { label: "Markets", href: "/markets" },
    { label: "Trading", href: "/trading" },
    { label: "Investments", href: "/investments" },
    { label: "Real Estate", href: "/real-estate" },
    { label: "Signals", href: "/signals" },
    { label: "Investment Plans", href: "/plans" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Risk Disclosure", href: "/risk-disclosure" },
    { label: "Regulation & Compliance", href: "/regulation-compliance" },
    { label: "Compliance", href: "/compliance" },
    { label: "Security", href: "/security" },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Vertex Global Markets" className="h-8 w-8 rounded" />
              <span className="font-display font-bold">
                <span style={{ color: 'hsl(145, 60%, 45%)' }}>Vertex</span>{' '}
                <span style={{ color: 'hsl(195, 70%, 45%)' }}>Global</span>{' '}
                <span style={{ color: 'hsl(225, 65%, 45%)' }}>Markets</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered trading and investment platform serving investors in 180+ countries worldwide.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 pb-2 text-center">
          <p className="text-xs text-muted-foreground/60 mb-4">
            Trading involves risk and may not be suitable for all users.
          </p>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Vertex Global Markets. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-xl">
            Trading financial instruments involves significant risk. Please trade responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
