import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, XCircle, Signal, Loader2, Users } from "lucide-react";
import { useState } from "react";

interface SignalSubscription {
  id: string;
  userName: string;
  email: string;
  plan: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  expired: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

const AdminSignals = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Placeholder data — will be connected to DB when signals table is created
  const signals: SignalSubscription[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Signal Subscriptions</h1>
        <p className="text-muted-foreground text-sm">Manage trading signal subscriptions — minimum $200/week</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Signal className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Active Signals</p>
                <p className="text-xl font-display font-bold text-foreground">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10"><Users className="h-5 w-5 text-warning" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
                <p className="text-xl font-display font-bold text-warning">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10"><Users className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Active Subscribers</p>
                <p className="text-xl font-display font-bold text-success">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Signal className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Min. Subscription</p>
                <p className="text-xl font-display font-bold text-foreground">$200/wk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search subscribers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Period</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No signal subscriptions yet. Subscribers will appear here once users purchase signals.</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSignals;
