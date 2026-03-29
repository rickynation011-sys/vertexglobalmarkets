import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-symbol.png";

const navItems = [
  { label: "Markets", href: "/markets" },
  { label: "Trading", href: "/trading" },
  { label: "Investments", href: "/investments" },
  { label: "Signals", href: "/signals" },
  { label: "About", href: "/about" },
];

const useOnlineCount = (base = 1247) => {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => {
        const drift = Math.round((Math.random() - 0.48) * 7);
        return Math.max(base - 60, Math.min(base + 80, prev + drift));
      });
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, [base]);
  return count;
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const onlineCount = useOnlineCount();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Vertex Global Markets" className="h-10 w-10 rounded" />
          <span className="font-display font-bold text-lg">
            <span style={{ color: 'hsl(145, 60%, 45%)' }}>Vertex</span>{' '}
            <span style={{ color: 'hsl(195, 70%, 45%)' }}>Global</span>{' '}
            <span style={{ color: 'hsl(225, 65%, 45%)' }}>Markets</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <Users size={12} />
            <span className="font-medium tabular-nums">{onlineCount.toLocaleString()}</span>
            <span className="hidden lg:inline">online</span>
          </span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-border px-4 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" size="sm" className="flex-1" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="flex-1 bg-gradient-brand text-primary-foreground font-semibold" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
