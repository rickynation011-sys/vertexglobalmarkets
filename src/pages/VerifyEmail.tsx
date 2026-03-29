import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Mail, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-symbol.png";
import { useAuth } from "@/contexts/AuthContext";

const VerifyEmail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  // Check URL hash for confirmation callback
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=signup") || hash.includes("type=email")) {
      setConfirmed(true);
    }
  }, []);

  // If user is verified, redirect to dashboard
  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !user?.email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: window.location.origin },
    });
    setResending(false);
    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Confirmation email sent!", description: "Check your inbox." });
      setCooldown(60);
    }
  };

  if (confirmed) {
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
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <CardTitle className="text-xl font-display">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now access all platform features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gradient-brand text-primary-foreground font-semibold"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Mail className="h-16 w-16 text-primary mx-auto" />
          <CardTitle className="text-xl font-display">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation email to{" "}
            <span className="text-foreground font-medium">{user?.email || "your email"}</span>.
            Please check your inbox and click the verification link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Check your spam/junk folder if you don't see the email.</p>
                <p>The confirmation link will expire after some time.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleResend}
            variant="outline"
            className="w-full"
            disabled={resending || cooldown > 0}
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Confirmation Email"}
          </Button>

          <div className="flex justify-between items-center pt-2">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
