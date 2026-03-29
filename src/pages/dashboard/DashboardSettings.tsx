import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import TwoFactorSetup from "@/components/dashboard/TwoFactorSetup";

type NotificationPrefs = {
  trade_executed_in_app: boolean;
  trade_executed_email: boolean;
  trade_executed_push: boolean;
  deposit_withdrawal_in_app: boolean;
  deposit_withdrawal_email: boolean;
  deposit_withdrawal_push: boolean;
  market_news_in_app: boolean;
  market_news_email: boolean;
  market_news_push: boolean;
};

const defaultPrefs: NotificationPrefs = {
  trade_executed_in_app: true,
  trade_executed_email: true,
  trade_executed_push: true,
  deposit_withdrawal_in_app: true,
  deposit_withdrawal_email: true,
  deposit_withdrawal_push: true,
  market_news_in_app: true,
  market_news_email: true,
  market_news_push: true,
};

const DashboardSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: kycStatus } = useQuery({
    queryKey: ["kyc-status", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("kyc_verifications").select("status").eq("user_id", user!.id).order("submitted_at", { ascending: false }).limit(1).single();
      return data?.status ?? "not_submitted";
    },
    enabled: !!user,
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setCountry(profile.country ?? "");
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({ full_name: fullName, phone, country }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated successfully.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const kycBadge = (() => {
    switch (kycStatus) {
      case "approved": return <Badge className="bg-success/10 text-success text-xs">Verified</Badge>;
      case "pending": return <Badge className="bg-warning/10 text-warning text-xs">Pending</Badge>;
      case "rejected": return <Badge className="bg-destructive/10 text-destructive text-xs">Rejected</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground text-xs">Not Submitted</Badge>;
    }
  })();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input value={user?.email ?? ""} disabled className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Country</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending}>
            {profileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Lock className="h-4 w-4" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TwoFactorSetup />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">KYC Verification</p>
              <p className="text-xs text-muted-foreground">Identity verification status</p>
            </div>
            {kycBadge}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Account Status</p>
              <p className="text-xs text-muted-foreground">Your account standing</p>
            </div>
            <Badge className={`text-xs ${profile?.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
              {profile?.status ?? "active"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <NotificationPreferencesCard userId={user?.id} />
    </div>
  );
};

const notifCategories = [
  {
    label: "Trade Executed",
    desc: "Get notified when a trade is executed",
    keys: { in_app: "trade_executed_in_app", email: "trade_executed_email", push: "trade_executed_push" } as const,
  },
  {
    label: "Deposit / Withdrawal",
    desc: "Transaction confirmations",
    keys: { in_app: "deposit_withdrawal_in_app", email: "deposit_withdrawal_email", push: "deposit_withdrawal_push" } as const,
  },
  {
    label: "Market News",
    desc: "Important market updates",
    keys: { in_app: "market_news_in_app", email: "market_news_email", push: "market_news_push" } as const,
  },
];

function NotificationPreferencesCard({ userId }: { userId?: string }) {
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ["notification-preferences", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_preferences" as any)
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error && error.code === "PGRST116") {
        // No row yet – insert default
        const { data: inserted } = await supabase
          .from("notification_preferences" as any)
          .insert({ user_id: userId, ...defaultPrefs } as any)
          .select("*")
          .single();
        return (inserted as any as NotificationPrefs) ?? defaultPrefs;
      }
      return (data as any as NotificationPrefs) ?? defaultPrefs;
    },
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPrefs>) => {
      const { error } = await supabase
        .from("notification_preferences" as any)
        .update(updates as any)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleToggle = (key: keyof NotificationPrefs, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  const current = prefs ?? defaultPrefs;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {notifCategories.map((cat) => (
          <div key={cat.label} className="space-y-2">
            <div>
              <p className="text-sm font-medium text-foreground">{cat.label}</p>
              <p className="text-xs text-muted-foreground">{cat.desc}</p>
            </div>
            <div className="flex items-center gap-6 pl-2">
              {(["in_app", "email", "push"] as const).map((channel) => {
                const key = cat.keys[channel];
                return (
                  <label key={channel} className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={current[key]}
                      onCheckedChange={(v) => handleToggle(key, v)}
                      disabled={isLoading}
                    />
                    <span className="text-xs text-muted-foreground capitalize">{channel.replace("_", "-")}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default DashboardSettings;