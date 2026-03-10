import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";

const history = [
  { id: "TXN-001284", type: "Trade", asset: "EUR/USD", side: "Buy", amount: "$5,000", pnl: "+$420.00", status: "Closed", date: "Mar 10, 2026 14:32" },
  { id: "TXN-001283", type: "Deposit", asset: "-", side: "-", amount: "$10,000", pnl: "-", status: "Completed", date: "Mar 9, 2026 09:15" },
  { id: "TXN-001282", type: "Trade", asset: "BTC/USDT", side: "Sell", amount: "$8,200", pnl: "+$1,280.00", status: "Closed", date: "Mar 8, 2026 22:10" },
  { id: "TXN-001281", type: "Investment", asset: "Balanced Plan", side: "-", amount: "$10,000", pnl: "+$720.00", status: "Active", date: "Mar 7, 2026 11:00" },
  { id: "TXN-001280", type: "Withdrawal", asset: "-", side: "-", amount: "$2,000", pnl: "-", status: "Completed", date: "Mar 6, 2026 16:45" },
  { id: "TXN-001279", type: "Trade", asset: "Gold", side: "Buy", amount: "$3,500", pnl: "+$890.00", status: "Closed", date: "Mar 5, 2026 10:20" },
  { id: "TXN-001278", type: "Trade", asset: "AAPL", side: "Buy", amount: "$3,200", pnl: "-$320.00", status: "Closed", date: "Mar 4, 2026 15:55" },
  { id: "TXN-001277", type: "Trade", asset: "ETH/USDT", side: "Sell", amount: "$4,100", pnl: "+$650.00", status: "Closed", date: "Mar 3, 2026 08:30" },
  { id: "TXN-001276", type: "Deposit", asset: "-", side: "-", amount: "$5,000", pnl: "-", status: "Completed", date: "Mar 2, 2026 12:00" },
  { id: "TXN-001275", type: "Trade", asset: "GBP/JPY", side: "Sell", amount: "$6,000", pnl: "-$180.00", status: "Closed", date: "Mar 1, 2026 19:40" },
];

const statusColor: Record<string, string> = {
  Closed: "bg-muted text-muted-foreground",
  Completed: "bg-success/10 text-success",
  Active: "bg-primary/10 text-primary",
  Processing: "bg-warning/10 text-warning",
};

const DashboardHistory = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground text-sm">View all your past transactions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-9" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="trade">Trades</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="investment">Investments</SelectItem>
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
                  <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Asset</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Side</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">P&L</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{tx.id}</td>
                    <td className="p-4 text-foreground">{tx.type}</td>
                    <td className="p-4 text-foreground">{tx.asset}</td>
                    <td className={`p-4 ${tx.side === "Buy" ? "text-success" : tx.side === "Sell" ? "text-destructive" : "text-muted-foreground"}`}>{tx.side}</td>
                    <td className="p-4 text-foreground">{tx.amount}</td>
                    <td className={`p-4 ${tx.pnl.startsWith("+") ? "text-success" : tx.pnl.startsWith("-") && tx.pnl !== "-" ? "text-destructive" : "text-muted-foreground"}`}>{tx.pnl}</td>
                    <td className="p-4"><Badge className={`text-xs ${statusColor[tx.status] || ""}`}>{tx.status}</Badge></td>
                    <td className="p-4 text-right text-muted-foreground text-xs">{tx.date}</td>
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

export default DashboardHistory;
