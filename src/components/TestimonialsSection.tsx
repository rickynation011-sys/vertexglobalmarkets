import { motion } from "framer-motion";
import { Star } from "lucide-react";
import testimonialJames from "@/assets/testimonial-james.jpg";
import testimonialSarah from "@/assets/testimonial-sarah.jpg";
import testimonialMarco from "@/assets/testimonial-marco.jpg";

const testimonials = [
  {
    name: "James Richardson",
    role: "Portfolio Manager, London",
    quote: "Vertex's AI trading engine has consistently delivered results. The platform's institutional-grade tools rival anything I've used at major brokerages.",
    rating: 5,
    photo: testimonialJames,
  },
  {
    name: "Sarah Chen",
    role: "Independent Trader, Singapore",
    quote: "The copy trading feature transformed my investment approach. I've diversified across multiple strategies and seen steady monthly returns.",
    rating: 5,
    photo: testimonialSarah,
  },
  {
    name: "Marco Rossi",
    role: "Crypto Investor, Milan",
    quote: "Finally a platform that combines traditional markets with crypto. The multi-asset portfolio management is exceptional.",
    rating: 5,
    photo: testimonialMarco,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-gradient-brand">Global Investors</span>
          </h2>
          <p className="text-muted-foreground text-lg">Join millions of investors who trust Vertex Global Markets.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="p-8 rounded-2xl bg-card border border-border shadow-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                <div>
                  <p className="font-display font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
