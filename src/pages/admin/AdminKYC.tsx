import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, Search, Clock } from "lucide-react";
import { useState } from "react";

const mockKYC = [
  { id: "1", user: "Sarah Wilson", email: "sarah@example.com", type: "Passport", submitted: "Mar 8, 2026", status: "pending" },
  { id: "2", user: "Emily Davis", email: "emily@example.com", type: "National ID", submitted: "Mar 7, 2026", status: "pending" },
  { id: "3", user: "Tom Hardy", email: "tom@example.com", type: "Driver's License", submitted: "Mar 6, 2026", status: "pending" },
  { id: "4", user: "John Doe", email: "john@example.com", type: "Passport", submitted: "Mar 5, 2026", status: "approved" },
  { id: "5", user: "Mike Chen", email: "mike@example.com", type: "National ID", submitted: "Mar 4, 2026", status: "approved" },
  { id: "6", user: "Anna Kowalski", email: "anna@example.com", type: "Passport", submitted: "Mar 3, 2026", status: "rejected" },
];

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const AdminKYC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = mockKYC.filter((k) => filter === "all" || k.status === filter);
  const selectedKYC = mockKYC.find((k) => k.id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">KYC Verification</h1>
        <p className="text-muted-foreground text-sm">Review and approve identity verifications</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending", count: mockKYC.filter((k) => k.status === "pending").length, icon: Clock, color: "text-warning" },
          { label: "Approved", count: mockKYC.filter((k) => k.status === "approved").length, icon: CheckCircle, color: "text-success" },
          { label: "Rejected", count: mockKYC.filter((k) => k.status === "rejected").length, icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search submissions..." className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Document</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Submitted</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((kyc) => (
                    <tr key={kyc.id} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${selected === kyc.id ? "bg-muted/50" : ""}`} onClick={() => setSelected(kyc.id)}>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{kyc.user}</p>
                        <p className="text-xs text-muted-foreground">{kyc.email}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">{kyc.type}</td>
                      <td className="p-4 text-muted-foreground text-xs">{kyc.submitted}</td>
                      <td className="p-4"><Badge className={`text-xs ${statusColors[kyc.status]}`}>{kyc.status}</Badge></td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {kyc.status === "pending" && (
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

        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Review Panel</h3>
            {selectedKYC ? (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">User</span><span className="text-foreground">{selectedKYC.user}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground">{selectedKYC.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Document</span><span className="text-foreground">{selectedKYC.type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span className="text-foreground">{selectedKYC.submitted}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={`text-xs ${statusColors[selectedKYC.status]}`}>{selectedKYC.status}</Badge></div>
                </div>
                <div className="p-8 rounded-lg bg-muted/50 border border-border text-center text-xs text-muted-foreground">Document Preview Area</div>
                {selectedKYC.status === "pending" && (
                  <>
                    <Textarea placeholder="Reviewer notes (optional)..." className="text-sm" />
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-success text-primary-foreground font-semibold" size="sm"><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
                      <Button className="flex-1" variant="destructive" size="sm"><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a submission to review</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminKYC;
