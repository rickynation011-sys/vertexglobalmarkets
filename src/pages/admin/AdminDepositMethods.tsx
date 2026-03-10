import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Wallet, Loader2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DepositMethod {
  id: string;
  currency: string;
  network: string | null;
  wallet_address: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminDepositMethods = () => {
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ currency: "", network: "", wallet_address: "", label: "" });

  const fetchMethods = async () => {
    // Admin policy covers ALL, so we can select all including inactive
    const { data } = await supabase
      .from("deposit_methods")
      .select("*")
      .order("created_at", { ascending: false });
    setMethods((data as DepositMethod[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMethods(); }, []);

  const resetForm = () => {
    setForm({ currency: "", network: "", wallet_address: "", label: "" });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.currency || !form.wallet_address) {
      toast.error("Currency and wallet address are required");
      return;
    }

    if (editingId) {
      const { error } = await supabase.from("deposit_methods").update({
        currency: form.currency,
        network: form.network || null,
        wallet_address: form.wallet_address,
        label: form.label || null,
        updated_at: new Date().toISOString(),
      }).eq("id", editingId);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Deposit method updated");
    } else {
      const { error } = await supabase.from("deposit_methods").insert({
        currency: form.currency,
        network: form.network || null,
        wallet_address: form.wallet_address,
        label: form.label || null,
      });
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Deposit method added");
    }

    setDialogOpen(false);
    resetForm();
    fetchMethods();
  };

  const handleEdit = (m: DepositMethod) => {
    setForm({
      currency: m.currency,
      network: m.network ?? "",
      wallet_address: m.wallet_address,
      label: m.label ?? "",
    });
    setEditingId(m.id);
    setDialogOpen(true);
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from("deposit_methods").update({ is_active: active }).eq("id", id);
    fetchMethods();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deposit method?")) return;
    await supabase.from("deposit_methods").delete().eq("id", id);
    toast.success("Deleted");
    fetchMethods();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Deposit Methods</h1>
          <p className="text-muted-foreground text-sm">Manage crypto wallet addresses for user deposits</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand text-primary-foreground font-semibold">
              <Plus className="h-4 w-4 mr-2" /> Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Add"} Deposit Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Currency *</label>
                <Input placeholder="e.g. BTC, ETH, USDT" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Network</label>
                <Input placeholder="e.g. ERC20, TRC20, BEP20" value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Wallet Address *</label>
                <Input placeholder="Enter wallet address" value={form.wallet_address} onChange={(e) => setForm({ ...form, wallet_address: e.target.value })} className="mt-1 font-mono text-xs" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Label (optional)</label>
                <Input placeholder="e.g. Main BTC Wallet" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="mt-1" />
              </div>
              <Button className="w-full bg-gradient-brand text-primary-foreground font-semibold" onClick={handleSave}>
                {editingId ? "Update" : "Add"} Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Methods</p>
            <p className="text-2xl font-display font-bold text-foreground">{methods.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-display font-bold text-success">{methods.filter(m => m.is_active).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Currencies</p>
            <p className="text-2xl font-display font-bold text-primary">{new Set(methods.map(m => m.currency)).size}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Currency</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Network</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Wallet Address</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Label</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Active</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {methods.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No deposit methods configured yet</td></tr>
                ) : (
                  methods.map((m) => (
                    <tr key={m.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Badge variant="outline" className="font-mono">{m.currency}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{m.network ?? "—"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{m.wallet_address}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(m.wallet_address); toast.success("Copied"); }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{m.label ?? "—"}</td>
                      <td className="p-4">
                        <Switch checked={m.is_active} onCheckedChange={(checked) => handleToggle(m.id, checked)} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(m)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(m.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDepositMethods;
