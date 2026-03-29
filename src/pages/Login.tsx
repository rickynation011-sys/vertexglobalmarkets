import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock, Loader2, Wand2, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-symbol.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleResendConfirmation = async () => {
    const resendEmail = email.trim();
    if (!resendEmail) {
      toast({ title: "Enter your email first", variant: "destructive" });
      return;
    }
    if (resendCooldown > 0) return;
    setResendLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: resendEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    setResendLoading(false);
    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Confirmation email sent!", description: "Check your inbox." });
      setResendCooldown(60);
    }
  };
  
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }

    // Check if MFA is enrolled
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTOTP = factorsData?.totp?.some((f) => f.status === "verified");

    if (hasVerifiedTOTP) {
      setLoading(false);
      navigate("/mfa-challenge");
      return;
    }

    // No MFA - check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: authData.user.id,
      _role: "admin",
    });

    setLoading(false);
    navigate(isAdmin ? "/admin" : "/dashboard");
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setMagicLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMagicSent(true);
    }
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
          <CardTitle className="text-xl font-display">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your trading dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="password" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Password
              </TabsTrigger>
              <TabsTrigger value="magic" className="flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5" /> Magic Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">Password</label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
                {/* Resend confirmation email */}
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
                >
                  {resendLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {resendCooldown > 0 ? `Resend confirmation in ${resendCooldown}s` : "Resend confirmation email"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="magic">
              {magicSent ? (
                <div className="text-center space-y-4 py-2">
                  <CheckCircle className="h-12 w-12 text-success mx-auto" />
                  <div>
                    <p className="text-foreground font-medium">Check your email</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We've sent a magic login link to <span className="text-foreground">{magicEmail}</span>
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setMagicSent(false)}>Send again</Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} className="pl-9" required maxLength={255} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">We'll send a secure link to your email. Click it to sign in instantly — no password needed.</p>
                  <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground font-semibold" disabled={magicLoading}>
                    {magicLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                    Send Magic Link
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Create Account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;