import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchTestimonials, type LandingTestimonial } from "@/lib/landing-api";
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

const fallbackTestimonials = [
  { name: "Emily Watson", country: "🇺🇸 USA", review: "Was skeptical at first but it's been pretty consistent so far. Three months in and no complaints.", photo_url: testEmily, rating: 5 },
  { name: "Raj Patel", country: "🇮🇳 India", review: "The signals are honestly better than what I was paying for elsewhere. Saved me a lot of guesswork.", photo_url: testRaj, rating: 5 },
  { name: "Marie Lefevre", country: "🇫🇷 France", review: "I barely knew anything about trading when I started. Copy trading made it easy to just... follow someone who knows what they're doing.", photo_url: testMarie, rating: 4 },
  { name: "Kenji Tanaka", country: "🇯🇵 Japan", review: "Everything loads fast, trades go through quick. That's all I really need.", photo_url: testKenji, rating: 5 },
  { name: "Anna Kowalski", country: "🇵🇱 Poland", review: "Picked the balanced plan and it's been doing well. Not crazy returns but steady, which I prefer.", photo_url: testAnna, rating: 4 },
  { name: "Carlos Mendez", country: "🇲🇽 Mexico", review: "Had an issue with a deposit once. Support sorted it out same day, which was nice.", photo_url: testCarlos, rating: 4 },
  { name: "Sarah Mitchell", country: "🇬🇧 UK", review: "Used to have accounts on like three different platforms. Moved everything here and honestly wish I did it sooner.", photo_url: testSarah, rating: 5 },
  { name: "Ahmed Hassan", country: "🇦🇪 UAE", review: "I check the leaderboard way too often haha. It's weirdly motivating seeing where you rank.", photo_url: testAhmed, rating: 5 },
  { name: "Lisa Johansson", country: "🇸🇪 Sweden", review: "No hidden fees, no weird charges. What you see is what you get. Refreshing.", photo_url: testLisa, rating: 5 },
  { name: "Tomás García", country: "🇪🇸 Spain", review: "Told a friend about it, he signed up, and we both got a bonus. Pretty cool referral setup.", photo_url: testTomas, rating: 4 },
  { name: "Chen Wei", country: "🇨🇳 China", review: "The charts are really good. Not as bloated as some terminal software I've tried. Clean and fast.", photo_url: testChen, rating: 5 },
  { name: "Fatima Al-Rashid", country: "🇸🇦 Saudi Arabia", review: "I feel safe using this platform. The 2FA and verification steps actually make a difference.", photo_url: testFatima, rating: 5 },
  { name: "Patrick O'Connor", country: "🇮🇪 Ireland", review: "Woke up and my daily profit was already processed. Love that I don't have to do anything manually.", photo_url: testPatrick, rating: 5 },
  { name: "Julia Schneider", country: "🇩🇪 Germany", review: "Security was my biggest concern. The encryption and 2FA put my mind at ease.", photo_url: testJulia, rating: 4 },
  { name: "Dmitri Volkov", country: "🇷🇺 Russia", review: "Started copying one of the top traders here. Not gonna lie, the results have been solid.", photo_url: testDmitri, rating: 5 },
  { name: "Priya Sharma", country: "🇮🇳 India", review: "Works great on my phone. I mostly trade during my commute and it handles everything fine.", photo_url: testPriya, rating: 4 },
  { name: "Marco Bianchi", country: "🇮🇹 Italy", review: "For what you're getting, the pricing is fair. I've paid more for way less on other platforms.", photo_url: testMarco, rating: 5 },
  { name: "Kim Soo-Yeon", country: "🇰🇷 South Korea", review: "The market signals have been pretty spot on. Not perfect every time, but overall really helpful.", photo_url: testKim, rating: 4 },
  { name: "Eva Lindqvist", country: "🇳🇴 Norway", review: "Withdrew my profits last week. It actually went through fast, which I wasn't expecting tbh.", photo_url: testEva, rating: 5 },
  { name: "Robert van Dijk", country: "🇳🇱 Netherlands", review: "I like the calculator tool. Helps me figure out what to expect before I commit money.", photo_url: testRobert, rating: 4 },
  { name: "Amara Osei", country: "🇬🇭 Ghana", review: "Not many platforms work well for us here in West Africa. This one does. Really appreciate that.", photo_url: testAmara, rating: 5 },
  { name: "Daniel Fischer", country: "🇦🇹 Austria", review: "I spread my investments across a few different categories. The diversification options are solid.", photo_url: testDanielF, rating: 4 },
  { name: "Sophie Martin", country: "🇨🇦 Canada", review: "KYC took like 10 minutes. Way faster than I expected. The whole setup was smooth.", photo_url: testSophieM, rating: 5 },
  { name: "Hugo Ferreira", country: "🇧🇷 Brazil", review: "The dashboard is clean, easy to read. I don't need a manual to figure things out.", photo_url: testHugo, rating: 5 },
  { name: "Yuki Yamamoto", country: "🇯🇵 Japan", review: "Real estate investments on a trading platform? That was new to me. Tried it and it's actually working out.", photo_url: testYuki, rating: 4 },
];

const ITEMS_PER_VIEW = 3;

const ExtendedTestimonials = () => {
  const { data: dbTestimonials } = useQuery({ queryKey: ["landing-testimonials"], queryFn: fetchTestimonials, staleTime: 60000 });
  const testimonials = dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;
  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_VIEW);
  const [page, setPage] = useState(0);

  const next = useCallback(() => setPage((p) => (p + 1) % totalPages), [totalPages]);
  const prev = useCallback(() => setPage((p) => (p - 1 + totalPages) % totalPages), [totalPages]);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  useEffect(() => { if (page >= totalPages) setPage(0); }, [totalPages, page]);

  const visible = testimonials.slice(page * ITEMS_PER_VIEW, page * ITEMS_PER_VIEW + ITEMS_PER_VIEW);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">What Our <span className="text-gradient-brand">Investors Say</span></h2>
          <p className="text-muted-foreground text-lg">Real feedback from traders and investors worldwide.</p>
        </motion.div>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={page} className="grid grid-cols-1 md:grid-cols-3 gap-6" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
              {visible.map((t) => {
                const initials = t.name.split(" ").map((w) => w[0]).join("");
                const rating = t.rating;
                return (
                  <div key={t.name} className="p-6 md:p-8 rounded-2xl bg-card border border-border shadow-card flex flex-col">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`h-4 w-4 ${j < rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed mb-6 italic flex-1">"{t.review}"</p>
                    <div className="flex items-center gap-3">
                      {t.photo_url ? (
                        <img src={t.photo_url} alt={t.name} loading="lazy" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">{initials}</div>
                      )}
                      <div>
                        <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.country}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full h-10 w-10"><ChevronLeft className="h-5 w-5" /></Button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === page ? "bg-primary" : "bg-muted-foreground/30"}`} />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} className="rounded-full h-10 w-10"><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExtendedTestimonials;
