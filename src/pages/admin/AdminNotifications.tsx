import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Send, Plus, Trash2 } from "lucide-react";

const notifications = [
  { id: 1, title: "System Maintenance Alert", message: "Scheduled maintenance on March 15", target: "All Users", status: "sent", date: "Mar 10, 2026" },
  { id: 2, title: "New Feature: AI Signals", message: "Try our new AI trading signals", target: "Active Traders", status: "sent", date: "Mar 8, 2026" },
  { id: 3, title: "KYC Reminder", message: "Complete your verification to unlock trading", target: "Unverified Users", status: "scheduled", date: "Mar 12, 2026" },
];

const AdminNotifications = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm">Send and manage platform notifications</p>
      </div>

      {/* Send new notification */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Send className="h-4 w-4" /> Send Notification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Title</label>
              <Input placeholder="Notification title" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Target Audience</label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select audience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Traders</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                  <SelectItem value="unverified">Unverified Users</SelectItem>
                  <SelectItem value="vip">VIP Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Message</label>
            <Textarea placeholder="Write your notification message..." className="mt-1 min-h-[100px]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch /> Push notification
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch defaultChecked /> In-app notification
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch /> Email
              </label>
            </div>
            <Button className="bg-gradient-brand text-primary-foreground font-semibold gap-2"><Send className="h-4 w-4" /> Send</Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Notification History</h3>
          {notifications.map((n) => (
            <div key={n.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">To: {n.target} • {n.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${n.status === "sent" ? "bg-success/10 text-success" : "bg-info/10 text-info"}`}>{n.status}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
