import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-symbol.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) {
      setLoading(false);
      toast({ title: "Login failed", description: authError.message, variant: "destructive" });
      return;
    }
    // Check admin role
    const { data: roleData } = await supabase.rpc("has_role", {
      _user_id: authData.user.id,
      _role: "admin",
    });
    setLoading(false);
    if (!roleData) {
      await supabase.auth.signOut();
      toast({ title: "Access denied", description: "You do not have admin privileges.", variant: "destructive" });
      return;
    }
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-glow opacity-20 pointer-events-none" />
      <Card className="w-full max-w-md bg-card border-border relative z-10">
        <CardHeader className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logo} alt="Vertex" className="h-10 w-10 rounded" />
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-display">Admin Portal</CardTitle>
          <CardDescription>Secure administrator access only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="admin@vertexglobal.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground font-semibold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Admin Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
