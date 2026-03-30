import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, TrendingUp, Building2, DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InvestmentPlan {
  id: string;
  key: string;
  value: {
    name: string;
    annualRate: number;
    risk: string;
    min: number;
    max: number;
    duration: number;
    description: string;
    features: string[];
    popular?: boolean;
  };
}

const AdminInvestments = () => {
  const queryClient = useQueryClient();
  const [planDialog, setPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "", annualRate: "", risk: "Medium", min: "", max: "", duration: "", description: "", features: "", popular: false,
  });

  const { data: investments, isLoading } = useQuery({
    queryKey: ["admin-investments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("investments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: investmentPlans } = useQuery({
    queryKey: ["investment-plans"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*").like("key", "investment_plan_%");
      return (data ?? []).map(d => ({ id: d.id, key: d.key, value: d.value as any })) as InvestmentPlan[];
    },
  });

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0;
  const totalCurrentValue = investments?.reduce((sum, inv) => sum + Number(inv.current_value), 0) ?? 0;
  const activeCount = investments?.filter(i => i.status === "active").length ?? 0;
  const realEstateInvestments = investments?.filter(i => i.plan_name.toLowerCase().includes("real estate")) ?? [];

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusColor: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    completed: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const openNewPlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: "", annualRate: "", risk: "Medium", min: "", max: "", duration: "", description: "", features: "", popular: false });
    setPlanDialog(true);
  };

  const openEditPlan = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.value.name, annualRate: String(plan.value.annualRate), risk: plan.value.risk,
      min: String(plan.value.min), max: String(plan.value.max), duration: String(plan.value.duration),
      description: plan.value.description, features: plan.value.features.join("\n"), popular: plan.value.popular ?? false,
    });
    setPlanDialog(true);
  };

  const savePlan = async () => {
    if (!planForm.name || !planForm.annualRate || !planForm.min || !planForm.max || !planForm.duration) {
      toast.error("Please fill all required fields");
      return;
    }
    const planValue = {
      name: planForm.name, annualRate: Number(planForm.annualRate), risk: planForm.risk,
      min: Number(planForm.min), max: Number(planForm.max), duration: Number(planForm.duration),
      description: planForm.description, features: planForm.features.split("\n").filter(Boolean), popular: planForm.popular,
    };
    const key = editingPlan ? editingPlan.key : `investment_plan_${planForm.name.toLowerCase().replace(/\s+/g, "_")}`;

    if (editingPlan) {
      const { error } = await supabase.from("platform_settings").update({ value: planValue as any }).eq("id", editingPlan.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Plan updated");
    } else {
      const { error } = await supabase.from("platform_settings").insert({ key, value: planValue as any, description: `Investment plan: ${planForm.name}` });
      if (error) { toast.error(error.message); return; }
      toast.success("Plan created");
    }
    queryClient.invalidateQueries({ queryKey: ["investment-plans"] });
    setPlanDialog(false);
  };

  const deletePlan = async (plan: InvestmentPlan) => {
    if (!confirm(`Delete plan "${plan.value.name}"?`)) return;
    const { error } = await supabase.from("platform_settings").delete().eq("id", plan.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Plan deleted");
    queryClient.invalidateQueries({ queryKey: ["investment-plans"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Investment Management</h1>
        <p className="text-muted-foreground text-sm">Manage investment plans and view all user investments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
              <div><p className="text-xs text-muted-foreground">Total Investments</p><p className="text-xl font-display font-bold text-foreground">{investments?.length ?? 0}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div>
              <div><p className="text-xs text-muted-foreground">Total Invested</p><p className="text-xl font-display font-bold text-foreground">{fmt(totalInvested)}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="h-5 w-5 text-emerald-400" /></div>
              <div><p className="text-xs text-muted-foreground">Current Value</p><p className="text-xl font-display font-bold text-foreground">{fmt(totalCurrentValue)}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
              <div><p className="text-xs text-muted-foreground">Active</p><p className="text-xl font-display font-bold text-foreground">{activeCount}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Plan Editor */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Investment Plans (Database-Driven)</CardTitle>
            <Button size="sm" onClick={openNewPlan}><Plus className="h-3.5 w-3.5 mr-1" /> New Plan</Button>
          </div>
        </CardHeader>
        <CardContent>
          {(investmentPlans ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No custom plans yet. Click "New Plan" to create one, or existing hardcoded plans will be used as defaults.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Name</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Annual Rate</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Min/Max</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Duration</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Risk</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(investmentPlans ?? []).map(plan => (
                    <tr key={plan.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 px-2 font-medium text-foreground text-xs">{plan.value.name}{plan.value.popular && <Badge className="ml-1 text-[9px]">Popular</Badge>}</td>
                      <td className="py-2.5 px-2 text-success text-xs">{plan.value.annualRate}%</td>
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">${plan.value.min.toLocaleString()} – ${plan.value.max.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">{plan.value.duration} days</td>
                      <td className="py-2.5 px-2"><Badge variant="outline" className="text-[10px]">{plan.value.risk}</Badge></td>
                      <td className="py-2.5 px-2 text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditPlan(plan)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePlan(plan)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Investments Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">All Investments</CardTitle></CardHeader>
        <CardContent>
          {investments?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No investments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">User ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Plan</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Current Value</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Return</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Start</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">End</th>
                  </tr>
                </thead>
                <tbody>
                  {investments?.map((inv) => (
                    <tr key={inv.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{inv.user_id.slice(0, 8)}...</td>
                      <td className="py-3 px-3 font-medium text-foreground">{inv.plan_name}</td>
                      <td className="py-3 px-3 text-muted-foreground">{fmt(Number(inv.amount))}</td>
                      <td className="py-3 px-3 text-foreground">{fmt(Number(inv.current_value))}</td>
                      <td className="py-3 px-3 text-emerald-400">+{Number(inv.return_pct ?? 0).toFixed(1)}%</td>
                      <td className="py-3 px-3"><Badge variant="outline" className={statusColor[inv.status] ?? ""}>{inv.status}</Badge></td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{new Date(inv.started_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{new Date(inv.ends_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Editor Dialog */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Investment Plan" : "Create Investment Plan"}</DialogTitle>
            <DialogDescription>Configure the plan parameters. Users will see these in the investment dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Plan Name *</Label><Input value={planForm.name} onChange={e => setPlanForm(p => ({ ...p, name: e.target.value }))} placeholder="Growth Plan" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Annual Rate (%) *</Label><Input type="number" value={planForm.annualRate} onChange={e => setPlanForm(p => ({ ...p, annualRate: e.target.value }))} placeholder="2.5" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Min ($) *</Label><Input type="number" value={planForm.min} onChange={e => setPlanForm(p => ({ ...p, min: e.target.value }))} placeholder="500" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Max ($) *</Label><Input type="number" value={planForm.max} onChange={e => setPlanForm(p => ({ ...p, max: e.target.value }))} placeholder="100000" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Duration (days) *</Label><Input type="number" value={planForm.duration} onChange={e => setPlanForm(p => ({ ...p, duration: e.target.value }))} placeholder="60" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Risk Level</Label><Input value={planForm.risk} onChange={e => setPlanForm(p => ({ ...p, risk: e.target.value }))} placeholder="Medium" /></div>
              <div className="flex items-end gap-2 pb-1">
                <input type="checkbox" checked={planForm.popular} onChange={e => setPlanForm(p => ({ ...p, popular: e.target.checked }))} className="h-4 w-4 rounded border-border" />
                <Label className="text-xs">Mark as Popular</Label>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea value={planForm.description} onChange={e => setPlanForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Plan description..." /></div>
            <div className="space-y-1.5"><Label className="text-xs">Features (one per line)</Label><Textarea value={planForm.features} onChange={e => setPlanForm(p => ({ ...p, features: e.target.value }))} rows={3} placeholder="AI-assisted rebalancing&#10;Weekly reports&#10;Priority withdrawals" /></div>
            <Button className="w-full" onClick={savePlan}>{editingPlan ? "Update Plan" : "Create Plan"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvestments;
