import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Bot, Bell, User, Lock } from "lucide-react";

const DashboardSettings = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and trading preferences</p>
      </div>

      {/* Profile */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Full Name</label>
              <Input defaultValue="John Doe" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input defaultValue="john@example.com" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <Input defaultValue="+1 555 123 4567" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Country</label>
              <Input defaultValue="United States" className="mt-1" />
            </div>
          </div>
          <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Lock className="h-4 w-4" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">KYC Verification</p>
              <p className="text-xs text-muted-foreground">Identity verification status</p>
            </div>
            <Badge className="bg-success/10 text-success text-xs">Verified</Badge>
          </div>
          <Button variant="outline" size="sm">Change Password</Button>
        </CardContent>
      </Card>

      {/* Trading preferences */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Bot className="h-4 w-4" /> Trading Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Auto Trading</p>
              <p className="text-xs text-muted-foreground">Enable AI-powered automated trading</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Risk Level</label>
              <Select defaultValue="medium">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Conservative (Low)</SelectItem>
                  <SelectItem value="medium">Balanced (Medium)</SelectItem>
                  <SelectItem value="high">Aggressive (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Max Daily Loss</label>
              <Input defaultValue="500" type="number" className="mt-1" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Copy Trading</p>
              <p className="text-xs text-muted-foreground">Allow others to copy your trades</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Trade Executed", desc: "Get notified when a trade is executed" },
            { label: "Deposit/Withdrawal", desc: "Transaction confirmations" },
            { label: "AI Signals", desc: "New trading signal alerts" },
            { label: "Market News", desc: "Important market updates" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettings;
