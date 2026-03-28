import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, DollarSign, Link2, Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

const DashboardReferrals = () => {
  const { user } = useAuth();
  const { format } = useCurrency();

  const { data: referralCode } = useQuery({
    queryKey: ["referral_code", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user!.id)
        .single();
      return data?.code ?? null;
    },
    enabled: !!user,
  });

  const { data: referrals } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const totalReferrals = referrals?.length ?? 0;
  const totalEarned = referrals?.reduce((s, r) => s + Number(r.bonus_amount), 0) ?? 0;
  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Referral Program</h1>
        <p className="text-muted-foreground text-sm">Invite friends and earn rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
              <p className="text-xl font-display font-bold text-foreground">{totalReferrals}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earned</p>
              <p className="text-xl font-display font-bold text-success">{format(totalEarned)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Referrals</p>
              <p className="text-xl font-display font-bold text-foreground">
                {referrals?.filter(r => r.status === "completed").length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code & Link */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Your Referral Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Your Referral Code</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-lg font-mono font-bold text-primary bg-primary/10 p-3 rounded-lg border border-primary/20 text-center tracking-widest">
                    {referralCode}
                  </code>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode, "Referral code")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Your Referral Link</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-foreground bg-muted p-3 rounded-lg border border-border break-all">
                    {referralLink}
                  </code>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink, "Referral link")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Share your code or link with friends. When they sign up and make their first deposit or investment, you'll earn a bonus!
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading your referral code...</p>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {(referrals ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No referrals yet. Share your code to start earning!
            </p>
          ) : (
            <div className="space-y-2">
              {(referrals ?? []).map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm text-foreground">Referred User</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Badge variant={ref.status === "completed" ? "default" : "secondary"}>
                      {ref.status}
                    </Badge>
                    {Number(ref.bonus_amount) > 0 && (
                      <span className="text-sm font-medium text-success">+{format(Number(ref.bonus_amount))}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardReferrals;
