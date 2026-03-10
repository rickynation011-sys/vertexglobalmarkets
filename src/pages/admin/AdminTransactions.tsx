import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, XCircle, Eye, ArrowDownLeft, ArrowUpRight, Download } from "lucide-react";
import { useState } from "react";

const mockTransactions = [
  { id: "TXN-5001", user: "John Doe", email: "john@example.com", type: "deposit", method: "Bank Transfer", amount: "$5,000.00", status: "pending", date: "Mar 10, 2026 14:32" },
  { id: "TXN-5002", user: "Sarah Wilson", email: "sarah@example.com", type: "withdrawal", method: "BTC", amount: "$2,500.00", status: "pending", date: "Mar 10, 2026 13:15" },
  { id: "TXN-5003", user: "Mike Chen", email: "mike@example.com", type: "deposit", method: "USDT (TRC20)", amount: "$10,000.00", status: "pending", date: "Mar 10, 2026 11:00" },
  { id: "TXN-5004", user: "Lisa Anderson", email: "lisa@example.com", type: "withdrawal", method: "Bank Transfer", amount: "$15,000.00", status: "pending", date: "Mar 9, 2026 22:45" },
  { id: "TXN-5005", user: "James Brown", email: "james@example.com", type: "deposit", method: "Credit Card", amount: "$1,500.00", status: "approved", date: "Mar 9, 2026 18:30" },
  { id: "TXN-5006", user: "Emily Davis", email: "emily@example.com", type: "deposit", method: "ETH", amount: "$3,200.00", status: "approved", date: "Mar 9, 2026 15:20" },
  { id: "TXN-5007", user: "Tom Hardy", email: "tom@example.com", type: "withdrawal", method: "USDT (TRC20)", amount: "$8,000.00", status: "rejected", date: "Mar 8, 2026 10:00" },
  { id: "TXN-5008", user: "Anna Kowalski", email: "anna@example.com", type: "deposit", method: "Bank Transfer", amount: "$500.00", status: "completed", date: "Mar 8, 2026 09:00" },
];

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-primary/10 text-primary",
};

const AdminTransactions = () => {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = mockTransactions.filter(
    (t) => (filter === "all" || t.status === filter) && (typeFilter === "all" || t.type === typeFilter)
  );

  const pendingDeposits = mockTransactions.filter((t) => t.type === "deposit" && t.status === "pending");
  const pendingWithdrawals = mockTransactions.filter((t) => t.type === "withdrawal" && t.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Transaction Management</h1>
          <p className="text-muted-foreground text-sm">Approve deposits and withdrawals</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Pending</p>
            <p className="text-2xl font-display font-bold text-warning">{mockTransactions.filter((t) => t.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Deposits</p>
            <p className="text-2xl font-display font-bold text-success">{pendingDeposits.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
            <p className="text-2xl font-display font-bold text-info">{pendingWithdrawals.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Volume Today</p>
            <p className="text-2xl font-display font-bold text-foreground">$45,700</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">ID</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Method</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{tx.id}</td>
                    <td className="p-4">
                      <p className="font-medium text-foreground">{tx.user}</p>
                      <p className="text-xs text-muted-foreground">{tx.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {tx.type === "deposit" ? <ArrowDownLeft className="h-3 w-3 text-success" /> : <ArrowUpRight className="h-3 w-3 text-warning" />}
                        <span className="capitalize text-foreground">{tx.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{tx.method}</td>
                    <td className="p-4 font-medium text-foreground">{tx.amount}</td>
                    <td className="p-4"><Badge className={`text-xs ${statusColors[tx.status]}`}>{tx.status}</Badge></td>
                    <td className="p-4 text-muted-foreground text-xs">{tx.date}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {tx.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success"><CheckCircle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Eye className="h-4 w-4" /></Button>
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

export default AdminTransactions;
