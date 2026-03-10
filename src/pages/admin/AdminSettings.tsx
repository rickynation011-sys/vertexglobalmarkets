import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, Globe, Shield, DollarSign, Bot, Users, Bell } from "lucide-react";

const AdminSettings = () => {
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
              <Input defaultValue="Vertex Global Markets" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Support Email</label>
              <Input defaultValue="support@vertexglobal.com" className="mt-1" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Temporarily disable the platform for users</p>
            </div>
            <Switch />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Maintenance Message</label>
            <Textarea defaultValue="We are currently performing scheduled maintenance. Please check back shortly." className="mt-1" />
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
              <Input defaultValue="100" type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Maximum Withdrawal (USD)</label>
              <Input defaultValue="50000" type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Withdrawal Fee (%)</label>
              <Input defaultValue="1.5" type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Deposit Fee (%)</label>
              <Input defaultValue="0" type="number" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Supported Payment Methods</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Bank Transfer", "Credit Card", "Bitcoin", "USDT (TRC20)", "Ethereum", "PayPal"].map((m) => (
                <label key={m} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" /> {m}
                </label>
              ))}
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
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Copy Trading</p>
              <p className="text-xs text-muted-foreground">Allow users to copy other traders</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">AI Signals Marketplace</p>
              <p className="text-xs text-muted-foreground">Enable trading signal marketplace</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Max Leverage</label>
              <Select defaultValue="100">
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
              <Select defaultValue="medium">
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
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Require KYC for Withdrawals</p>
              <p className="text-xs text-muted-foreground">Users must verify identity before withdrawing</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Enforce 2FA for all users</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Fraud Detection</p>
              <p className="text-xs text-muted-foreground">Automated suspicious activity monitoring</p>
            </div>
            <Switch defaultChecked />
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
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Referral Bonus (USD)</label>
              <Input defaultValue="50" type="number" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Commission Rate (%)</label>
              <Input defaultValue="5" type="number" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="bg-gradient-brand text-primary-foreground font-semibold gap-2">
        <Save className="h-4 w-4" /> Save All Settings
      </Button>
    </div>
  );
};

export default AdminSettings;
