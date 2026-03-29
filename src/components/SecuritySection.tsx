import { motion } from "framer-motion";
import { ShieldCheck, Lock, Fingerprint, Eye, MailCheck } from "lucide-react";

const features = [
  { icon: Fingerprint, title: "Two-Factor Authentication", desc: "Extra layer of security on every login with TOTP-based 2FA." },
  { icon: Lock, title: "Secure Password Hashing", desc: "Industry-standard bcrypt hashing protects your credentials at rest." },
  { icon: ShieldCheck, title: "Encrypted Transactions", desc: "All financial transactions are encrypted end-to-end with TLS 1.3." },
  { icon: Eye, title: "Fraud Monitoring", desc: "AI-powered systems detect and prevent suspicious activity in real time." },
  { icon: MailCheck, title: "Email Verification", desc: "Every account is verified via email to prevent unauthorized access." },
];

const SecuritySection = () => (
  <section className="py-24 relative">
    <div className="container mx-auto px-4">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Platform <span className="text-gradient-brand">Security</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your assets and data are protected by enterprise-grade security infrastructure.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border
                       hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)] transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm mb-2">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SecuritySection;
