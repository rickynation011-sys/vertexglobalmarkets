import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-symbol.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" />
      <Card className="w-full max-w-md bg-card border-border relative z-10">
        <CardHeader className="text-center space-y-3">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <img src={logo} alt="Vertex" className="h-10 w-10 rounded" />
            <span className="font-display font-bold text-lg text-foreground">
              Vertex <span className="text-gradient-brand">Global Markets</span>
            </span>
          </Link>
          <CardTitle className="text-xl font-display">Forgot Password</CardTitle>
          <CardDescription>We'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <div>
                <p className="text-foreground font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We've sent a password reset link to <span className="text-foreground">{email}</span>
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Send again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    maxLength={255}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground font-semibold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Reset Link
              </Button>
            </form>
          )}
          <div className="mt-4">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 justify-center">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
