import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-symbol.png";
import { Link } from "react-router-dom";

const MfaChallenge = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getFactors = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error || !data) {
        navigate("/login");
        return;
      }
      const verified = data.totp.filter((f) => f.status === "verified");
      if (verified.length === 0) {
        // No MFA enrolled, go straight to dashboard
        navigate("/dashboard");
        return;
      }
      setFactorId(verified[0].id);
    };
    getFactors();
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({ title: "Please enter a 6-digit code", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setLoading(false);
      toast({ title: "Error", description: challengeError.message, variant: "destructive" });
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    setLoading(false);
    if (verifyError) {
      toast({ title: "Invalid code", description: "Please check your authenticator app and try again.", variant: "destructive" });
      setCode("");
      return;
    }

    // Check admin role to route correctly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      navigate(isAdmin ? "/admin" : "/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  if (!factorId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-display">Two-Factor Authentication</CardTitle>
          <CardDescription>Enter the 6-digit code from your authenticator app to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-5">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[0.4em] font-mono h-14"
              autoFocus
            />
            <Button
              type="submit"
              className="w-full bg-gradient-brand text-primary-foreground font-semibold"
              disabled={loading || code.length !== 6}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Verify & Sign In
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Open your authenticator app (Google Authenticator, Authy, etc.) and enter the current code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MfaChallenge;