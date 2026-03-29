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
  { name: "Emily Watson", country: "🇺🇸 USA", text: "Was skeptical at first but it's been pretty consistent so far. Three months in and no complaints.", photo: testEmily },
  { name: "Raj Patel", country: "🇮🇳 India", text: "The signals are honestly better than what I was paying for elsewhere. Saved me a lot of guesswork.", photo: testRaj },
  { name: "Marie Lefevre", country: "🇫🇷 France", text: "I barely knew anything about trading when I started. Copy trading made it easy to just... follow someone who knows what they're doing.", photo: testMarie },
  { name: "Kenji Tanaka", country: "🇯🇵 Japan", text: "Everything loads fast, trades go through quick. That's all I really need.", photo: testKenji },
  { name: "Anna Kowalski", country: "🇵🇱 Poland", text: "Picked the balanced plan and it's been doing well. Not crazy returns but steady, which I prefer.", photo: testAnna },
  { name: "Carlos Mendez", country: "🇲🇽 Mexico", text: "Had an issue with a deposit once. Support sorted it out same day, which was nice.", photo: testCarlos },
  { name: "Sarah Mitchell", country: "🇬🇧 UK", text: "Used to have accounts on like three different platforms. Moved everything here and honestly wish I did it sooner.", photo: testSarah },
  { name: "Ahmed Hassan", country: "🇦🇪 UAE", text: "I check the leaderboard way too often haha. It's weirdly motivating seeing where you rank.", photo: testAhmed },
  { name: "Lisa Johansson", country: "🇸🇪 Sweden", text: "No hidden fees, no weird charges. What you see is what you get. Refreshing.", photo: testLisa },
  { name: "Tomás García", country: "🇪🇸 Spain", text: "Told a friend about it, he signed up, and we both got a bonus. Pretty cool referral setup.", photo: testTomas },
  { name: "Chen Wei", country: "🇨🇳 China", text: "The charts are really good. Not as bloated as some terminal software I've tried. Clean and fast.", photo: testChen },
  { name: "Fatima Al-Rashid", country: "🇸🇦 Saudi Arabia", text: "I feel safe using this platform. The 2FA and verification steps actually make a difference.", photo: testFatima },
  { name: "Patrick O'Connor", country: "🇮🇪 Ireland", text: "Woke up and my daily profit was already processed. Love that I don't have to do anything manually.", photo: testPatrick },
  { name: "Julia Schneider", country: "🇩🇪 Germany", text: "Security was my biggest concern. The encryption and 2FA put my mind at ease.", photo: testJulia },
  { name: "Dmitri Volkov", country: "🇷🇺 Russia", text: "Started copying one of the top traders here. Not gonna lie, the results have been solid.", photo: testDmitri },
  { name: "Priya Sharma", country: "🇮🇳 India", text: "Works great on my phone. I mostly trade during my commute and it handles everything fine.", photo: testPriya },
  { name: "Marco Bianchi", country: "🇮🇹 Italy", text: "For what you're getting, the pricing is fair. I've paid more for way less on other platforms.", photo: testMarco },
  { name: "Kim Soo-Yeon", country: "🇰🇷 South Korea", text: "The market signals have been pretty spot on. Not perfect every time, but overall really helpful.", photo: testKim },
  { name: "Eva Lindqvist", country: "🇳🇴 Norway", text: "Withdrew my profits last week. It actually went through fast, which I wasn't expecting tbh.", photo: testEva },
  { name: "Robert van Dijk", country: "🇳🇱 Netherlands", text: "I like the calculator tool. Helps me figure out what to expect before I commit money.", photo: testRobert },
  { name: "Amara Osei", country: "🇬🇭 Ghana", text: "Not many platforms work well for us here in West Africa. This one does. Really appreciate that.", photo: testAmara },
  { name: "Daniel Fischer", country: "🇦🇹 Austria", text: "I spread my investments across a few different categories. The diversification options are solid.", photo: testDanielF },
  { name: "Sophie Martin", country: "🇨🇦 Canada", text: "KYC took like 10 minutes. Way faster than I expected. The whole setup was smooth.", photo: testSophieM },
  { name: "Hugo Ferreira", country: "🇧🇷 Brazil", text: "The dashboard is clean, easy to read. I don't need a manual to figure things out.", photo: testHugo },
  { name: "Yuki Yamamoto", country: "🇯🇵 Japan", text: "Real estate investments on a trading platform? That was new to me. Tried it and it's actually working out.", photo: testYuki },
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
