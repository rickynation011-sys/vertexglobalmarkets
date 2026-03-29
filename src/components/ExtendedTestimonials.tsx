import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import testEmily from "@/assets/profiles/test-emily.jpg";
import testRaj from "@/assets/profiles/test-raj.jpg";
import testMarie from "@/assets/profiles/test-marie.jpg";
import testKenji from "@/assets/profiles/test-kenji.jpg";
import testAnna from "@/assets/profiles/test-anna.jpg";
import testCarlos from "@/assets/profiles/test-carlos.jpg";
import testSarah from "@/assets/profiles/test-sarah.jpg";
import testAhmed from "@/assets/profiles/test-ahmed.jpg";
import testLisa from "@/assets/profiles/test-lisa.jpg";
import testTomas from "@/assets/profiles/test-tomas.jpg";
import testChen from "@/assets/profiles/test-chen.jpg";
import testFatima from "@/assets/profiles/test-fatima.jpg";
import testPatrick from "@/assets/profiles/test-patrick.jpg";
import testJulia from "@/assets/profiles/test-julia.jpg";
import testDmitri from "@/assets/profiles/test-dmitri.jpg";
import testPriya from "@/assets/profiles/test-priya.jpg";
import testMarco from "@/assets/profiles/test-marco.jpg";
import testKim from "@/assets/profiles/test-kim.jpg";
import testEva from "@/assets/profiles/test-eva.jpg";
import testRobert from "@/assets/profiles/test-robert.jpg";
import testAmara from "@/assets/profiles/test-amara.jpg";
import testDanielF from "@/assets/profiles/test-daniel-f.jpg";
import testSophieM from "@/assets/profiles/test-sophie-m.jpg";
import testHugo from "@/assets/profiles/test-hugo.jpg";
import testYuki from "@/assets/profiles/test-yuki.jpg";

const testimonials = [
  { name: "Emily Watson", country: "🇺🇸 USA", text: "The automated trading tools have completely transformed my portfolio management.", photo: testEmily },
  { name: "Raj Patel", country: "🇮🇳 India", text: "Best platform for crypto and forex combined. The signals are incredibly accurate.", photo: testRaj },
  { name: "Marie Lefevre", country: "🇫🇷 France", text: "I started with minimal experience and the copy trading feature helped me earn consistently.", photo: testMarie },
  { name: "Kenji Tanaka", country: "🇯🇵 Japan", text: "Lightning-fast execution and the security features give me peace of mind.", photo: testKenji },
  { name: "Anna Kowalski", country: "🇵🇱 Poland", text: "The investment plans are well-structured. My returns have exceeded expectations.", photo: testAnna },
  { name: "Carlos Mendez", country: "🇲🇽 Mexico", text: "Customer support is responsive and the platform is incredibly intuitive.", photo: testCarlos },
  { name: "Sarah Mitchell", country: "🇬🇧 UK", text: "Switched from three different platforms to Vertex. Everything I need in one place.", photo: testSarah },
  { name: "Ahmed Hassan", country: "🇦🇪 UAE", text: "The leaderboard feature motivates me to improve my trading strategies daily.", photo: testAhmed },
  { name: "Lisa Johansson", country: "🇸🇪 Sweden", text: "Transparent fees and excellent returns. Highly recommend for serious investors.", photo: testLisa },
  { name: "Tomás García", country: "🇪🇸 Spain", text: "The referral program has been a great bonus on top of my trading profits.", photo: testTomas },
  { name: "Chen Wei", country: "🇨🇳 China", text: "Advanced charting tools rival professional terminal software.", photo: testChen },
  { name: "Fatima Al-Rashid", country: "🇸🇦 Saudi Arabia", text: "Secure, reliable, and profitable. This is the future of online trading.", photo: testFatima },
  { name: "Patrick O'Connor", country: "🇮🇪 Ireland", text: "The daily profit processing feature is genius. Wake up to gains every morning.", photo: testPatrick },
  { name: "Julia Schneider", country: "🇩🇪 Germany", text: "Two-factor authentication and encrypted transactions make me feel safe.", photo: testJulia },
  { name: "Dmitri Volkov", country: "🇷🇺 Russia", text: "Started copy trading top performers and saw immediate improvements.", photo: testDmitri },
  { name: "Priya Sharma", country: "🇮🇳 India", text: "The mobile experience is seamless. I trade on the go without any issues.", photo: testPriya },
  { name: "Marco Bianchi", country: "🇮🇹 Italy", text: "Professional-grade tools at retail prices. Can't ask for more.", photo: testMarco },
  { name: "Kim Soo-Yeon", country: "🇰🇷 South Korea", text: "The market analysis and signals have helped me make informed decisions.", photo: testKim },
  { name: "Eva Lindqvist", country: "🇳🇴 Norway", text: "Withdrew my profits smoothly with no delays. Trust fully established.", photo: testEva },
  { name: "Robert van Dijk", country: "🇳🇱 Netherlands", text: "The investment calculator helps me plan my financial goals precisely.", photo: testRobert },
  { name: "Amara Osei", country: "🇬🇭 Ghana", text: "Finally a platform that works well for African investors. Great experience.", photo: testAmara },
  { name: "Daniel Fischer", country: "🇦🇹 Austria", text: "The portfolio diversification options are excellent for risk management.", photo: testDanielF },
  { name: "Sophie Martin", country: "🇨🇦 Canada", text: "KYC verification was quick and the platform feels very professional.", photo: testSophieM },
  { name: "Hugo Ferreira", country: "🇧🇷 Brazil", text: "Consistent monthly returns and a clean, modern interface.", photo: testHugo },
  { name: "Yuki Yamamoto", country: "🇯🇵 Japan", text: "The real estate investment category is a unique offering I haven't seen elsewhere.", photo: testYuki },
];

const ITEMS_PER_VIEW = 3;
const TOTAL_PAGES = Math.ceil(testimonials.length / ITEMS_PER_VIEW);

const ExtendedTestimonials = () => {
  const [page, setPage] = useState(0);

  const next = useCallback(() => setPage((p) => (p + 1) % TOTAL_PAGES), []);
  const prev = useCallback(() => setPage((p) => (p - 1 + TOTAL_PAGES) % TOTAL_PAGES), []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  const visible = testimonials.slice(page * ITEMS_PER_VIEW, page * ITEMS_PER_VIEW + ITEMS_PER_VIEW);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            What Our <span className="text-gradient-brand">Investors Say</span>
          </h2>
          <p className="text-muted-foreground text-lg">Real feedback from traders and investors worldwide.</p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              {visible.map((t) => (
                <div
                  key={t.name}
                  className="p-6 md:p-8 rounded-2xl bg-card border border-border shadow-card flex flex-col"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-6 italic flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.photo}
                      alt={t.name}
                      loading="lazy"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-primary/20"
                    />
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === page ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} className="rounded-full h-10 w-10">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExtendedTestimonials;
