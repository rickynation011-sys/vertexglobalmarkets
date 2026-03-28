import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, Edit, Eye, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Pages ───
const staticPages = [
  { title: "About Us", slug: "/about", status: "published" },
  { title: "Terms of Service", slug: "/terms", status: "published" },
  { title: "Privacy Policy", slug: "/privacy", status: "published" },
  { title: "Risk Disclosure", slug: "/risk-disclosure", status: "published" },
  { title: "Compliance", slug: "/compliance", status: "published" },
  { title: "Security", slug: "/security", status: "published" },
  { title: "Careers", slug: "/careers", status: "published" },
  { title: "Blog", slug: "/blog", status: "published" },
  { title: "Contact", slug: "/contact", status: "published" },
  { title: "Press", slug: "/press", status: "published" },
  { title: "Markets", slug: "/markets", status: "published" },
  { title: "Trading", slug: "/trading", status: "published" },
  { title: "Investments", slug: "/investments", status: "published" },
  { title: "Signals", slug: "/signals", status: "published" },
  { title: "Plans", slug: "/plans", status: "published" },
  { title: "Real Estate", slug: "/real-estate", status: "published" },
];

// ─── Investment Plans (managed via platform_settings) ───
interface InvestmentPlan {
  name: string;
  returns: string;
  risk: string;
  min: number;
  annualRate: number;
  duration: number;
  status: "active" | "paused";
}

const defaultPlans: InvestmentPlan[] = [
  { name: "Conservative Growth", returns: "4-6%", risk: "Low", min: 500, annualRate: 5, duration: 30, status: "active" },
  { name: "Balanced Portfolio", returns: "6-9%", risk: "Medium", min: 2000, annualRate: 7.5, duration: 30, status: "active" },
  { name: "Aggressive Alpha", returns: "8-12%", risk: "High", min: 5000, annualRate: 10, duration: 30, status: "active" },
  { name: "Forex Specialist", returns: "5-8%", risk: "Medium", min: 1000, annualRate: 6.5, duration: 30, status: "active" },
  { name: "Crypto Momentum", returns: "7-12%", risk: "High", min: 1500, annualRate: 9.5, duration: 30, status: "active" },
  { name: "Real Estate Income", returns: "6-10%", risk: "Medium", min: 2500, annualRate: 8, duration: 90, status: "active" },
  { name: "VIP Elite", returns: "10-15%", risk: "Variable", min: 25000, annualRate: 12.5, duration: 30, status: "active" },
];

interface Announcement {
  id: string;
  title: string;
  message: string;
  status: "active" | "expired";
  target: string;
  created_at: string;
}

const AdminContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ─── Announcements (stored in platform_settings as JSON array) ───
  const { data: announcementsSetting } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*").eq("key", "announcements").single();
      return data;
    },
  });

  const { data: plansSetting } = useQuery({
    queryKey: ["admin-plans-setting"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*").eq("key", "investment_plans").single();
      return data;
    },
  });

  const announcements: Announcement[] = Array.isArray(announcementsSetting?.value) ? (announcementsSetting.value as unknown as Announcement[]) : [];
  const plans: InvestmentPlan[] = Array.isArray(plansSetting?.value) ? (plansSetting.value as unknown as InvestmentPlan[]) : defaultPlans;

  // ─── Announcement Dialog ───
  const [annDialog, setAnnDialog] = useState<{ open: boolean; editing?: Announcement }>({ open: false });
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annTarget, setAnnTarget] = useState("All Users");
  const [annStatus, setAnnStatus] = useState<"active" | "expired">("active");

  // ─── Plan Dialog ───
  const [planDialog, setPlanDialog] = useState<{ open: boolean; editing?: InvestmentPlan; index?: number }>({ open: false });
  const [planName, setPlanName] = useState("");
  const [planReturns, setPlanReturns] = useState("");
  const [planRisk, setPlanRisk] = useState("Medium");
  const [planMin, setPlanMin] = useState("");
  const [planRate, setPlanRate] = useState("");
  const [planDuration, setPlanDuration] = useState("30");
  const [planStatus, setPlanStatus] = useState<"active" | "paused">("active");

  const saveAnnouncementsMutation = useMutation({
    mutationFn: async (newAnnouncements: Announcement[]) => {
      const { error } = await supabase.from("platform_settings").upsert({
        key: "announcements",
        value: newAnnouncements as any,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
  });

  const savePlansMutation = useMutation({
    mutationFn: async (newPlans: InvestmentPlan[]) => {
      const { error } = await supabase.from("platform_settings").upsert({
        key: "investment_plans",
        value: newPlans as any,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans-setting"] });
    },
  });

  const openNewAnnouncement = () => {
    setAnnTitle(""); setAnnMessage(""); setAnnTarget("All Users"); setAnnStatus("active");
    setAnnDialog({ open: true });
  };

  const openEditAnnouncement = (ann: Announcement) => {
    setAnnTitle(ann.title); setAnnMessage(ann.message); setAnnTarget(ann.target); setAnnStatus(ann.status);
    setAnnDialog({ open: true, editing: ann });
  };

  const handleSaveAnnouncement = () => {
    if (!annTitle.trim()) { toast.error("Title is required"); return; }
    const updated = [...announcements];
    if (annDialog.editing) {
      const idx = updated.findIndex(a => a.id === annDialog.editing!.id);
      if (idx >= 0) updated[idx] = { ...updated[idx], title: annTitle, message: annMessage, target: annTarget, status: annStatus };
    } else {
      updated.unshift({ id: crypto.randomUUID(), title: annTitle, message: annMessage, status: annStatus, target: annTarget, created_at: new Date().toISOString() });
    }
    saveAnnouncementsMutation.mutate(updated);
    toast.success(annDialog.editing ? "Announcement updated" : "Announcement created");
    setAnnDialog({ open: false });
  };

  const handleDeleteAnnouncement = (id: string) => {
    saveAnnouncementsMutation.mutate(announcements.filter(a => a.id !== id));
    toast.success("Announcement deleted");
  };

  const openNewPlan = () => {
    setPlanName(""); setPlanReturns(""); setPlanRisk("Medium"); setPlanMin(""); setPlanRate(""); setPlanDuration("30"); setPlanStatus("active");
    setPlanDialog({ open: true });
  };

  const openEditPlan = (plan: InvestmentPlan, index: number) => {
    setPlanName(plan.name); setPlanReturns(plan.returns); setPlanRisk(plan.risk); setPlanMin(String(plan.min));
    setPlanRate(String(plan.annualRate)); setPlanDuration(String(plan.duration)); setPlanStatus(plan.status);
    setPlanDialog({ open: true, editing: plan, index });
  };

  const handleSavePlan = () => {
    if (!planName.trim()) { toast.error("Plan name is required"); return; }
    const plan: InvestmentPlan = {
      name: planName, returns: planReturns, risk: planRisk, min: Number(planMin) || 100,
      annualRate: Number(planRate) || 5, duration: Number(planDuration) || 30, status: planStatus,
    };
    const updated = [...plans];
    if (planDialog.index !== undefined) {
      updated[planDialog.index] = plan;
    } else {
      updated.push(plan);
    }
    savePlansMutation.mutate(updated);
    toast.success(planDialog.editing ? "Plan updated" : "Plan created");
    setPlanDialog({ open: false });
  };

  const handleDeletePlan = (index: number) => {
    const updated = plans.filter((_, i) => i !== index);
    savePlansMutation.mutate(updated);
    toast.success("Plan deleted");
  };

  const handleTogglePlanStatus = (index: number) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], status: updated[index].status === "active" ? "paused" : "active" };
    savePlansMutation.mutate(updated);
    toast.success(`Plan ${updated[index].status === "active" ? "activated" : "paused"}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground text-sm">Manage pages, announcements, and investment plans</p>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Pages ({staticPages.length})</TabsTrigger>
          <TabsTrigger value="announcements">Announcements ({announcements.length})</TabsTrigger>
          <TabsTrigger value="plans">Investment Plans ({plans.length})</TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">{staticPages.length} pages — all pages are live and accessible</p>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-muted-foreground font-medium">Title</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Path</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staticPages.map((page) => (
                      <tr key={page.slug} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium text-foreground">{page.title}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{page.slug}</td>
                        <td className="p-4">
                          <Badge className="text-[10px] bg-success/10 text-success">{page.status}</Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(page.slug, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{announcements.length} announcements</p>
            <Button size="sm" className="gap-2" onClick={openNewAnnouncement}><Plus className="h-4 w-4" /> New Announcement</Button>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No announcements. Create one to notify users.</p>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{a.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">To: {a.target} • {new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${a.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditAnnouncement(a)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteAnnouncement(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{plans.length} investment plans</p>
            <Button size="sm" className="gap-2" onClick={openNewPlan}><Plus className="h-4 w-4" /> New Plan</Button>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-muted-foreground font-medium">Plan</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Returns</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Risk</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Min</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Rate</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Duration</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan, i) => (
                      <tr key={`${plan.name}-${i}`} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium text-foreground">{plan.name}</td>
                        <td className="p-4 text-success">{plan.returns}</td>
                        <td className="p-4 text-muted-foreground">{plan.risk}</td>
                        <td className="p-4 text-foreground">${plan.min.toLocaleString()}</td>
                        <td className="p-4 text-foreground">{plan.annualRate}%</td>
                        <td className="p-4 text-muted-foreground">{plan.duration}d</td>
                        <td className="p-4">
                          <Badge className={`text-[10px] cursor-pointer ${plan.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`} onClick={() => handleTogglePlanStatus(i)}>
                            {plan.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditPlan(plan, i)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePlan(i)}><Trash2 className="h-4 w-4" /></Button>
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

      {/* Announcement Dialog */}
      <Dialog open={annDialog.open} onOpenChange={(open) => !open && setAnnDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{annDialog.editing ? "Edit Announcement" : "New Announcement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Title</label>
              <Input value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="mt-1" placeholder="Announcement title" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Message</label>
              <Textarea value={annMessage} onChange={e => setAnnMessage(e.target.value)} className="mt-1 min-h-[80px]" placeholder="Write your announcement..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Target</label>
                <Select value={annTarget} onValueChange={setAnnTarget}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Users">All Users</SelectItem>
                    <SelectItem value="Active Traders">Active Traders</SelectItem>
                    <SelectItem value="VIP Users">VIP Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Select value={annStatus} onValueChange={v => setAnnStatus(v as any)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSaveAnnouncement} disabled={saveAnnouncementsMutation.isPending}>
              {saveAnnouncementsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Dialog */}
      <Dialog open={planDialog.open} onOpenChange={(open) => !open && setPlanDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{planDialog.editing ? "Edit Plan" : "New Investment Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Plan Name</label>
                <Input value={planName} onChange={e => setPlanName(e.target.value)} className="mt-1" placeholder="e.g. Growth Plan" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Returns (display)</label>
                <Input value={planReturns} onChange={e => setPlanReturns(e.target.value)} className="mt-1" placeholder="e.g. 5-8%" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Risk Level</label>
                <Select value={planRisk} onValueChange={setPlanRisk}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Minimum ($)</label>
                <Input value={planMin} onChange={e => setPlanMin(e.target.value)} type="number" className="mt-1" placeholder="500" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Annual Rate (%)</label>
                <Input value={planRate} onChange={e => setPlanRate(e.target.value)} type="number" className="mt-1" placeholder="7.5" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Duration (days)</label>
                <Input value={planDuration} onChange={e => setPlanDuration(e.target.value)} type="number" className="mt-1" placeholder="30" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={planStatus === "active"} onCheckedChange={v => setPlanStatus(v ? "active" : "paused")} />
              <span className="text-sm text-muted-foreground">{planStatus === "active" ? "Active" : "Paused"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSavePlan} disabled={savePlansMutation.isPending}>
              {savePlansMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" /> Save Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContent;
