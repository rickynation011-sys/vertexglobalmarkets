import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, Globe, Shield, DollarSign, Bot, Users, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Settings {
  [key: string]: any;
}

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    platform_name: "Vertex Global Markets",
    support_email: "support@vertexglobal.com",
    maintenance_mode: false,
    maintenance_message: "We are currently performing scheduled maintenance. Please check back shortly.",
    min_deposit: 100,
    max_withdrawal: 50000,
    withdrawal_fee: 1.5,
    deposit_fee: 0,
    auto_trading: true,
    copy_trading: true,
    ai_signals: true,
    max_leverage: "100",
    default_risk: "medium",
    kyc_for_trading: true,
    kyc_for_withdrawals: true,
    two_factor: false,
    fraud_detection: true,
    referral_program: true,
    referral_bonus: 50,
    commission_rate: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("platform_settings").select("*");
      if (data && data.length > 0) {
        const mapped: Settings = { ...settings };
        data.forEach((row) => {
          mapped[row.key] = row.value;
        });
        setSettings(mapped);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(settings);
    
    for (const [key, value] of entries) {
      await supabase
        .from("platform_settings")
        .upsert(
          { key, value: value as any, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
    }
    
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  const update = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground text-sm">Configure all platform parameters</p>
      </div>

      {/* General */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Platform Name</label>
              <Input value={settings.platform_name} onChange={(e) => update("platform_name", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Support Email</label>
              <Input value={settings.support_email} onChange={(e) => update("support_email", e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Temporarily disable the platform for users</p>
            </div>
            <Switch checked={!!settings.maintenance_mode} onCheckedChange={(v) => update("maintenance_mode", v)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Maintenance Message</label>
            <Textarea value={settings.maintenance_message} onChange={(e) => update("maintenance_message", e.target.value)} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Financial */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><DollarSign className="h-4 w-4" /> Financial Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Minimum Deposit (USD)</label>
              <Input value={settings.min_deposit} onChange={(e) => update("min_deposit", Number(e.target.value))} type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Maximum Withdrawal (USD)</label>
              <Input value={settings.max_withdrawal} onChange={(e) => update("max_withdrawal", Number(e.target.value))} type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Withdrawal Fee (%)</label>
              <Input value={settings.withdrawal_fee} onChange={(e) => update("withdrawal_fee", Number(e.target.value))} type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Deposit Fee (%)</label>
              <Input value={settings.deposit_fee} onChange={(e) => update("deposit_fee", Number(e.target.value))} type="number" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Bot className="h-4 w-4" /> Trading & AI Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Auto Trading System</p>
              <p className="text-xs text-muted-foreground">Enable AI-powered automated trading</p>
            </div>
            <Switch checked={!!settings.auto_trading} onCheckedChange={(v) => update("auto_trading", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Copy Trading</p>
              <p className="text-xs text-muted-foreground">Allow users to copy other traders</p>
            </div>
            <Switch checked={!!settings.copy_trading} onCheckedChange={(v) => update("copy_trading", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">AI Signals Marketplace</p>
              <p className="text-xs text-muted-foreground">Enable trading signal marketplace</p>
            </div>
            <Switch checked={!!settings.ai_signals} onCheckedChange={(v) => update("ai_signals", v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Max Leverage</label>
              <Select value={settings.max_leverage} onValueChange={(v) => update("max_leverage", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">1:10</SelectItem>
                  <SelectItem value="50">1:50</SelectItem>
                  <SelectItem value="100">1:100</SelectItem>
                  <SelectItem value="500">1:500</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Default Risk Level</label>
              <Select value={settings.default_risk} onValueChange={(v) => update("default_risk", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Conservative</SelectItem>
                  <SelectItem value="medium">Balanced</SelectItem>
                  <SelectItem value="high">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Require KYC for Trading</p>
              <p className="text-xs text-muted-foreground">Users must verify identity before trading</p>
            </div>
            <Switch checked={!!settings.kyc_for_trading} onCheckedChange={(v) => update("kyc_for_trading", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Require KYC for Withdrawals</p>
              <p className="text-xs text-muted-foreground">Users must verify identity before withdrawing</p>
            </div>
            <Switch checked={!!settings.kyc_for_withdrawals} onCheckedChange={(v) => update("kyc_for_withdrawals", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Enforce 2FA for all users</p>
            </div>
            <Switch checked={!!settings.two_factor} onCheckedChange={(v) => update("two_factor", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Fraud Detection</p>
              <p className="text-xs text-muted-foreground">Automated suspicious activity monitoring</p>
            </div>
            <Switch checked={!!settings.fraud_detection} onCheckedChange={(v) => update("fraud_detection", v)} />
          </div>
        </CardContent>
      </Card>

      {/* Referral */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Referral & Affiliate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Referral Program</p>
              <p className="text-xs text-muted-foreground">Enable user referral system</p>
            </div>
            <Switch checked={!!settings.referral_program} onCheckedChange={(v) => update("referral_program", v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Referral Bonus (USD)</label>
              <Input value={settings.referral_bonus} onChange={(e) => update("referral_bonus", Number(e.target.value))} type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Commission Rate (%)</label>
              <Input value={settings.commission_rate} onChange={(e) => update("commission_rate", Number(e.target.value))} type="number" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="bg-gradient-brand text-primary-foreground font-semibold gap-2" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save All Settings"}
      </Button>
    </div>
  );
};

export default AdminSettings;
