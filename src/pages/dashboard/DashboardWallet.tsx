import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownLeft, ArrowUpRight, Wallet, Copy, Shield } from "lucide-react";

const transactions = [
  { type: "Deposit", method: "Bank Transfer", amount: "+$5,000.00", status: "Completed", date: "Mar 8, 2026" },
  { type: "Withdrawal", method: "Crypto (BTC)", amount: "-$2,000.00", status: "Processing", date: "Mar 7, 2026" },
  { type: "Deposit", method: "Credit Card", amount: "+$1,500.00", status: "Completed", date: "Mar 5, 2026" },
  { type: "Withdrawal", method: "Bank Transfer", amount: "-$3,000.00", status: "Completed", date: "Mar 3, 2026" },
  { type: "Deposit", method: "Crypto (USDT)", amount: "+$10,000.00", status: "Completed", date: "Mar 1, 2026" },
];

const DashboardWallet = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Deposit & Withdraw</h1>
        <p className="text-muted-foreground text-sm">Manage your funds securely</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-xl font-display font-bold text-foreground">$19,500.00</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deposited</p>
              <p className="text-xl font-display font-bold text-foreground">$45,000.00</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Withdrawn</p>
              <p className="text-xl font-display font-bold text-foreground">$25,500.00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <Tabs defaultValue="deposit">
              <TabsList className="w-full">
                <TabsTrigger value="deposit" className="flex-1">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw" className="flex-1">Withdraw</TabsTrigger>
              </TabsList>
              <TabsContent value="deposit" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="usdt">USDT (TRC20)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Amount (USD)</label>
                  <Input placeholder="Enter amount" className="mt-1" type="number" />
                </div>
                <div className="flex gap-2">
                  {["$100", "$500", "$1,000", "$5,000"].map((amt) => (
                    <Button key={amt} variant="outline" size="sm" className="flex-1 text-xs">{amt}</Button>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">All transactions are secured with 256-bit SSL encryption.</p>
                </div>
                <Button className="w-full bg-gradient-brand text-primary-foreground font-semibold">Deposit Funds</Button>
              </TabsContent>
              <TabsContent value="withdraw" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Withdrawal Method</label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="usdt">USDT (TRC20)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Amount (USD)</label>
                  <Input placeholder="Enter amount" className="mt-1" type="number" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Wallet / Account</label>
                  <Input placeholder="Enter wallet address or account" className="mt-1" />
                </div>
                <Button className="w-full" variant="outline">Request Withdrawal</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === "Deposit" ? "bg-success/10" : "bg-warning/10"}`}>
                      {tx.type === "Deposit" ? <ArrowDownLeft className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-warning" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">{tx.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${tx.type === "Deposit" ? "text-success" : "text-foreground"}`}>{tx.amount}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardWallet;
