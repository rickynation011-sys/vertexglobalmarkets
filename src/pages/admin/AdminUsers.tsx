import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, Ban, CheckCircle, Eye, UserPlus } from "lucide-react";
import { useState } from "react";

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active", kyc: "approved", balance: "$12,450", joined: "Jan 15, 2026", trades: 142 },
  { id: "2", name: "Sarah Wilson", email: "sarah@example.com", status: "active", kyc: "pending", balance: "$8,200", joined: "Feb 3, 2026", trades: 67 },
  { id: "3", name: "Mike Chen", email: "mike@example.com", status: "active", kyc: "approved", balance: "$45,800", joined: "Dec 20, 2025", trades: 312 },
  { id: "4", name: "Anna Kowalski", email: "anna@example.com", status: "suspended", kyc: "rejected", balance: "$0", joined: "Mar 1, 2026", trades: 5 },
  { id: "5", name: "James Brown", email: "james@example.com", status: "active", kyc: "approved", balance: "$22,100", joined: "Nov 8, 2025", trades: 198 },
  { id: "6", name: "Emily Davis", email: "emily@example.com", status: "active", kyc: "pending", balance: "$3,500", joined: "Mar 5, 2026", trades: 12 },
  { id: "7", name: "Robert Taylor", email: "robert@example.com", status: "banned", kyc: "approved", balance: "$0", joined: "Oct 12, 2025", trades: 450 },
  { id: "8", name: "Lisa Anderson", email: "lisa@example.com", status: "active", kyc: "approved", balance: "$67,300", joined: "Sep 1, 2025", trades: 523 },
];

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  suspended: "bg-warning/10 text-warning",
  banned: "bg-destructive/10 text-destructive",
};

const kycColors: Record<string, string> = {
  approved: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-destructive/10 text-destructive",
};

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const filtered = mockUsers.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm">{mockUsers.length} total users</p>
        </div>
        <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold gap-2">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="KYC" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All KYC</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">KYC</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Balance</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Trades</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="p-4"><Badge className={`text-xs ${statusColors[user.status]}`}>{user.status}</Badge></td>
                    <td className="p-4"><Badge className={`text-xs ${kycColors[user.kyc]}`}>{user.kyc}</Badge></td>
                    <td className="p-4 text-foreground">{user.balance}</td>
                    <td className="p-4 text-muted-foreground">{user.trades}</td>
                    <td className="p-4 text-muted-foreground text-xs">{user.joined}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Ban className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
