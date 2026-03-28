import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone, Globe, DollarSign, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-symbol.png";
import { COUNTRIES, COUNTRY_CURRENCY_MAP, SUPPORTED_CURRENCIES } from "@/contexts/CurrencyContext";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Pre-fill referral code from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  // Auto-select currency when country changes
  useEffect(() => {
    if (country && COUNTRY_CURRENCY_MAP[country]) {
      setCurrency(COUNTRY_CURRENCY_MAP[country]);
    }
  }, [country]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !country || !phone.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Validate referral code if provided
    let referrerId: string | null = null;
    if (referralCode.trim()) {
      const { data: refUserId } = await supabase
        .rpc("lookup_referral_code", { _code: referralCode.trim().toUpperCase() });
      if (!refUserId) {
        setLoading(false);
        toast({ title: "Invalid referral code", description: "Please check the code and try again.", variant: "destructive" });
        return;
      }
      referrerId = refData.user_id;
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), country, currency, phone: phone.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) {
      setLoading(false);
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }

    // Update profile with additional fields
    if (authData.user) {
      await supabase.from("profiles").update({
        country,
        currency,
        phone: phone.trim(),
        referred_by: referrerId,
      } as any).eq("user_id", authData.user.id);

      // Create referral record
      if (referrerId) {
        await supabase.from("referrals").insert({
          referrer_id: referrerId,
          referred_user_id: authData.user.id,
          status: "registered",
        } as any);
      }
    }

    // Send welcome email
    supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'welcome',
        recipientEmail: email.trim(),
        idempotencyKey: `welcome-${email.trim()}`,
        templateData: { name: fullName.trim() },
      },
    });

    setLoading(false);
    toast({ title: "Account created!", description: "Check your email to verify your account." });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" />
      <Card className="w-full max-w-md bg-card border-border relative z-10">
        <CardHeader className="text-center space-y-3">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <img src={logo} alt="Vertex" className="h-10 w-10 rounded" />
            <span className="font-display font-bold text-lg">
              <span style={{ color: 'hsl(145, 60%, 45%)' }}>Vertex</span>{' '}
              <span style={{ color: 'hsl(195, 70%, 45%)' }}>Global</span>{' '}
              <span style={{ color: 'hsl(225, 65%, 45%)' }}>Markets</span>
            </span>
          </Link>
          <CardTitle className="text-xl font-display">Create Account</CardTitle>
          <CardDescription>Start investing in global markets today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" required maxLength={100} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required maxLength={255} />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="tel" placeholder="+1 234 567 8900" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" required maxLength={20} />
              </div>
            </div>

            {/* Country & Currency row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Country</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTRIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {SUPPORTED_CURRENCIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-9" required minLength={6} />
              </div>
            </div>

            {/* Referral Code */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Referral Code <span className="text-xs">(optional)</span></label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="e.g. VGM12345" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} className="pl-9 uppercase" maxLength={20} />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground font-semibold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-3">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
