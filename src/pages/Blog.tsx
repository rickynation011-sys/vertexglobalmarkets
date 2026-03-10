import SEO from "@/components/SEO";
import StaticPageLayout from "@/layouts/StaticPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const posts = [
  { title: "AI Trading Signals: How Machine Learning is Changing Forex", category: "Technology", date: "Mar 8, 2026", excerpt: "Discover how our AI models analyze millions of data points to generate high-probability trading signals.", slug: "#", readTime: "5 min" },
  { title: "Understanding Risk Management in Volatile Markets", category: "Education", date: "Mar 5, 2026", excerpt: "A comprehensive guide to position sizing, stop-losses, and portfolio diversification for modern traders.", slug: "#", readTime: "8 min" },
  { title: "Vertex Q1 2026: Record Growth and Platform Updates", category: "Company", date: "Mar 1, 2026", excerpt: "We crossed 500K active traders this quarter. Here's what we've been building and what's next.", slug: "#", readTime: "4 min" },
  { title: "Crypto Market Outlook: What to Expect in 2026", category: "Analysis", date: "Feb 25, 2026", excerpt: "Our analysts break down key trends, institutional adoption, and regulatory developments shaping the crypto landscape.", slug: "#", readTime: "7 min" },
  { title: "Copy Trading 101: Learn from the Best Performers", category: "Education", date: "Feb 20, 2026", excerpt: "How to select top traders to follow, manage risk, and build a passive income strategy through copy trading.", slug: "#", readTime: "6 min" },
  { title: "New: Multi-Asset Portfolio Analytics Dashboard", category: "Product", date: "Feb 15, 2026", excerpt: "Track your entire portfolio across forex, crypto, stocks, and commodities with our new analytics tools.", slug: "#", readTime: "3 min" },
];

const categoryColors: Record<string, string> = {
  Technology: "bg-primary/10 text-primary",
  Education: "bg-accent/10 text-accent",
  Company: "bg-secondary/10 text-secondary",
  Analysis: "bg-warning/10 text-warning",
  Product: "bg-success/10 text-success",
};

const Blog = () => (
  <StaticPageLayout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Vertex <span className="text-gradient-brand">Blog</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Market insights, platform updates, and educational content to help you trade smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.title} className="bg-card border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`text-xs ${categoryColors[post.category] ?? "bg-muted text-muted-foreground"}`}>{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">{post.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </StaticPageLayout>
);

export default Blog;
