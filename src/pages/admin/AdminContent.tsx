import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, Edit, Eye } from "lucide-react";

const pages = [
  { title: "About Us", slug: "/about", status: "published", updated: "Mar 8, 2026" },
  { title: "Terms of Service", slug: "/terms", status: "published", updated: "Mar 5, 2026" },
  { title: "Privacy Policy", slug: "/privacy", status: "published", updated: "Mar 5, 2026" },
  { title: "Risk Disclosure", slug: "/risk-disclosure", status: "published", updated: "Mar 3, 2026" },
  { title: "Compliance", slug: "/compliance", status: "draft", updated: "Mar 1, 2026" },
  { title: "Careers", slug: "/careers", status: "published", updated: "Feb 28, 2026" },
];

const announcements = [
  { title: "Platform Maintenance - March 15", status: "active", date: "Mar 10, 2026" },
  { title: "New Crypto Assets Available", status: "active", date: "Mar 8, 2026" },
  { title: "Updated Fee Structure", status: "expired", date: "Feb 20, 2026" },
];

const investmentPlans = [
  { name: "Conservative Growth", returns: "4-6%", risk: "Low", min: "$500", status: "active" },
  { name: "Balanced Portfolio", returns: "6-9%", risk: "Medium", min: "$2,000", status: "active" },
  { name: "Aggressive Alpha", returns: "8-12%", risk: "High", min: "$5,000", status: "active" },
  { name: "Forex Specialist", returns: "5-8%", risk: "Medium", min: "$1,000", status: "active" },
  { name: "Crypto Momentum", returns: "7-12%", risk: "High", min: "$1,500", status: "active" },
  { name: "VIP Elite", returns: "10-15%", risk: "Variable", min: "$25,000", status: "active" },
];

const AdminContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground text-sm">Manage pages, announcements, and investment plans</p>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="plans">Investment Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{pages.length} pages</p>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Page</Button>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-muted-foreground font-medium">Title</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Slug</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Updated</th>
                      <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.slug} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium text-foreground">{page.title}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{page.slug}</td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-xs ${page.status === "published" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{page.status}</span></td>
                        <td className="p-4 text-muted-foreground text-xs">{page.updated}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{announcements.length} announcements</p>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Announcement</Button>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {announcements.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${a.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{investmentPlans.length} plans</p>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Plan</Button>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-muted-foreground font-medium">Plan</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Est. Returns</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Risk</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Minimum</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investmentPlans.map((plan) => (
                      <tr key={plan.name} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium text-foreground">{plan.name}</td>
                        <td className="p-4 text-success">{plan.returns}</td>
                        <td className="p-4 text-muted-foreground">{plan.risk}</td>
                        <td className="p-4 text-foreground">{plan.min}</td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded text-xs bg-success/10 text-success">{plan.status}</span></td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
