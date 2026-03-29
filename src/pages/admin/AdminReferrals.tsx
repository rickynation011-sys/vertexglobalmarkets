import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, DollarSign, Settings, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const AdminReferrals = () => {
  const queryClient = useQueryClient();
  const [bonusType, setBonusType] = useState<"percentage" | "fixed">("percentage");
  const [bonusValue, setBonusValue] = useState("5");
  const [enabled, setEnabled] = useState(true);

  // Load referral settings
  const { data: settings } = useQuery({
    queryKey: ["platform_settings", "referral"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("key", "referral_config")
        .single();
      return data;
    },
  });

  useEffect(() => {
    if (settings?.value) {
      const val = settings.value as any;
      setBonusType(val.bonus_type || "percentage");
      setBonusValue(String(val.bonus_value ?? "5"));
      setEnabled(val.enabled !== false);
    }
  }, [settings]);

  // Load all referrals
  const { data: referrals } = useQuery({
    queryKey: ["admin_referrals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Load referral codes with profiles
  const { data: referralCodes } = useQuery({
    queryKey: ["admin_referral_codes"],
    queryFn: async () => {
      const { data } = await supabase.from("referral_codes").select("*");
      return data ?? [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin_profiles_for_referrals"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, email");
      return data ?? [];
    },
  });

  const getProfileName = (userId: string) => {
    const p = profiles?.find(p => p.user_id === userId);
    return p?.full_name || p?.email || userId.slice(0, 8);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const config = {
        bonus_type: bonusType,
        bonus_value: parseFloat(bonusValue) || 5,
        enabled,
      };
      const { data: existing } = await supabase
        .from("platform_settings")
        .select("id")
        .eq("key", "referral_config")
        .single();

      if (existing) {
        await supabase.from("platform_settings").update({ value: config as any }).eq("key", "referral_config");
      } else {
        await supabase.from("platform_settings").insert({
          key: "referral_config",
          value: config as any,
          description: "Referral system configuration",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform_settings", "referral"] });
      toast.success("Referral settings saved");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const approveMutation = useMutation({
    mutationFn: async (referralId: string) => {
      const ref = referrals?.find(r => r.id === referralId);
      if (!ref) throw new Error("Referral not found");

      // Update referral status
      const { error } = await supabase.from("referrals").update({ status: "completed", bonus_amount: ref.bonus_amount }).eq("id", referralId);
      if (error) throw error;

      // Credit the referrer's wallet
      const { data: referrerProfile } = await supabase.from("profiles").select("wallet_balance, email, full_name").eq("user_id", ref.referrer_id).single();
      if (referrerProfile) {
        await supabase.from("profiles").update({ wallet_balance: Number(referrerProfile.wallet_balance) + Number(ref.bonus_amount) }).eq("user_id", ref.referrer_id);

        // Send referral bonus email
        if (referrerProfile.email) {
          const referredProfile = profiles?.find(p => p.user_id === ref.referred_user_id);
          await supabase.functions.invoke('send-transactional-email', {
            body: {
              templateName: 'referral-bonus',
              recipientEmail: referrerProfile.email,
              idempotencyKey: `referral-bonus-${referralId}`,
              templateData: {
                name: referrerProfile.full_name || undefined,
                bonusAmount: Number(ref.bonus_amount).toFixed(2),
                referredUser: referredProfile?.full_name || referredProfile?.email || 'a new user',
              },
            },
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_referrals"] });
      toast.success("Referral approved and bonus credited");
    },
    onError: () => toast.error("Failed to approve referral"),
  });

  const totalReferrals = referrals?.length ?? 0;
  const totalBonusPaid = referrals?.reduce((s, r) => s + Number(r.bonus_amount), 0) ?? 0;

  // Compute per-user referral stats
  const referrerStats = referralCodes?.map(rc => {
    const userRefs = referrals?.filter(r => r.referrer_id === rc.user_id) ?? [];
    const totalEarned = userRefs.reduce((s, r) => s + Number(r.bonus_amount), 0);
    return {
      userId: rc.user_id,
      code: rc.code,
      name: getProfileName(rc.user_id),
      count: userRefs.length,
      earned: totalEarned,
    };
  }).filter(s => s.count > 0).sort((a, b) => b.count - a.count) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Referral Management</h1>
        <p className="text-muted-foreground text-sm">Configure and monitor the referral system</p>
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
              <p className="text-xl font-display font-bold">{totalReferrals}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Bonus Paid</p>
              <p className="text-xl font-display font-bold text-success">${totalBonusPaid.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique Referrers</p>
              <p className="text-xl font-display font-bold">{referrerStats.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" /> Referral Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Referral System</p>
              <p className="text-xs text-muted-foreground">Toggle the referral program on/off</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Bonus Type</label>
              <Select value={bonusType} onValueChange={(v) => setBonusType(v as any)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">
                Bonus Value {bonusType === "percentage" ? "(%)" : "($)"}
              </label>
              <Input type="number" min="0" step="0.1" value={bonusValue} onChange={(e) => setBonusValue(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Top Referrers */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          {referrerStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No referrals yet</p>
          ) : (
            <div className="space-y-2">
              {referrerStats.map(stat => (
                <div key={stat.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{stat.name}</p>
                    <p className="text-xs text-muted-foreground">Code: {stat.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{stat.count} referrals</p>
                    <p className="text-xs text-success">${stat.earned.toFixed(2)} earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Referrals */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {(referrals ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No referral records</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                   <tr className="border-b border-border text-muted-foreground">
                     <th className="text-left py-2 px-2">Referrer</th>
                     <th className="text-left py-2 px-2">Referred User</th>
                     <th className="text-left py-2 px-2">Level</th>
                     <th className="text-left py-2 px-2">Status</th>
                     <th className="text-right py-2 px-2">Bonus</th>
                     <th className="text-right py-2 px-2">Date</th>
                     <th className="text-right py-2 px-2">Action</th>
                   </tr>
                </thead>
                <tbody>
                  {(referrals ?? []).map(ref => (
                    <tr key={ref.id} className="border-b border-border/50">
                      <td className="py-2 px-2">{getProfileName(ref.referrer_id)}</td>
                      <td className="py-2 px-2">{getProfileName(ref.referred_user_id)}</td>
                      <td className="py-2 px-2">
                        <Select
                          value={String((ref as any).level || 1)}
                          onValueChange={async (val) => {
                            const { error } = await supabase.from("referrals").update({ level: parseInt(val) } as any).eq("id", ref.id);
                            if (error) { toast.error("Failed to update level"); return; }
                            queryClient.invalidateQueries({ queryKey: ["admin_referrals"] });
                            toast.success(`Level updated to ${val}`);
                          }}
                        >
                          <SelectTrigger className="w-20 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">L1 (10%)</SelectItem>
                            <SelectItem value="2">L2 (5%)</SelectItem>
                            <SelectItem value="3">L3 (2%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant={ref.status === "completed" ? "default" : "secondary"}>{ref.status}</Badge>
                      </td>
                       <td className="py-2 px-2 text-right">${Number(ref.bonus_amount).toFixed(2)}</td>
                       <td className="py-2 px-2 text-right text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</td>
                       <td className="py-2 px-2 text-right">
                         {ref.status === "pending" && (
                           <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(ref.id)} disabled={approveMutation.isPending}>
                             Approve
                           </Button>
                         )}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReferrals;
