import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Users, Trophy, MessageSquare, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAllTraders, upsertTrader, deleteTrader,
  fetchAllInvestors, upsertInvestor, deleteInvestor,
  fetchAllTestimonials, upsertTestimonial, deleteTestimonial,
  uploadLandingPhoto,
  type LandingTrader, type LandingInvestor, type LandingTestimonial,
} from "@/lib/landing-api";

// ── Generic form dialog ──
function FormDialog({ open, onOpenChange, title, children }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// ── TRADERS TAB ──
function TradersTab() {
  const qc = useQueryClient();
  const { data: traders = [] } = useQuery({ queryKey: ["admin-landing-traders"], queryFn: fetchAllTraders });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LandingTrader> | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async (form: Partial<LandingTrader>) => {
      let photo_url = form.photo_url;
      if (photoFile) photo_url = await uploadLandingPhoto(photoFile, "traders");
      await upsertTrader({ ...form, photo_url } as any);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-landing-traders"] }); qc.invalidateQueries({ queryKey: ["landing-traders"] }); setOpen(false); setEditing(null); setPhotoFile(null); toast.success("Trader saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteTrader,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-landing-traders"] }); qc.invalidateQueries({ queryKey: ["landing-traders"] }); toast.success("Trader deleted"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      ...(editing?.id ? { id: editing.id } : {}),
      name: fd.get("name") as string,
      country: fd.get("country") as string,
      flag: fd.get("flag") as string,
      win_rate: Number(fd.get("win_rate")),
      total_profit: fd.get("total_profit") as string,
      sort_order: Number(fd.get("sort_order") || 0),
      is_active: true,
      photo_url: editing?.photo_url,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Top Traders ({traders.length})</h3>
        <Button onClick={() => { setEditing({}); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Trader</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Win Rate</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {traders.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.photo_url ? <img src={t.photo_url} className="w-8 h-8 rounded-full object-cover" /> : "—"}</TableCell>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell>{t.flag} {t.country}</TableCell>
              <TableCell className="text-success">{t.win_rate}%</TableCell>
              <TableCell>{t.total_profit}</TableCell>
              <TableCell>{t.sort_order}</TableCell>
              <TableCell>{t.is_active ? "✓" : "✗"}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {traders.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No traders yet. Hardcoded defaults will be shown on the landing page.</TableCell></TableRow>}
        </TableBody>
      </Table>

      <FormDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setPhotoFile(null); } }} title={editing?.id ? "Edit Trader" : "Add Trader"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input name="name" defaultValue={editing?.name} required /></div>
            <div><Label>Country</Label><Input name="country" defaultValue={editing?.country} required /></div>
            <div><Label>Flag Emoji</Label><Input name="flag" defaultValue={editing?.flag || "🏳️"} required /></div>
            <div><Label>Win Rate (%)</Label><Input name="win_rate" type="number" defaultValue={editing?.win_rate || 90} required /></div>
            <div><Label>Total Profit</Label><Input name="total_profit" defaultValue={editing?.total_profit || "$0"} required /></div>
            <div><Label>Sort Order</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} /></div>
          </div>
          <div>
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-3 mt-1">
              {(editing?.photo_url || photoFile) && (
                <img src={photoFile ? URL.createObjectURL(photoFile) : editing?.photo_url!} className="w-12 h-12 rounded-full object-cover" />
              )}
              <label className="cursor-pointer flex items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" />Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Trader"}</Button>
        </form>
      </FormDialog>
    </div>
  );
}

// ── INVESTORS TAB ──
function InvestorsTab() {
  const qc = useQueryClient();
  const { data: investors = [] } = useQuery({ queryKey: ["admin-landing-investors"], queryFn: fetchAllInvestors });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LandingInvestor> | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async (form: Partial<LandingInvestor>) => {
      let photo_url = form.photo_url;
      if (photoFile) photo_url = await uploadLandingPhoto(photoFile, "investors");
      await upsertInvestor({ ...form, photo_url } as any);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-landing-investors"] }); qc.invalidateQueries({ queryKey: ["landing-investors"] }); setOpen(false); setEditing(null); setPhotoFile(null); toast.success("Investor saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteInvestor,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-landing-investors"] }); qc.invalidateQueries({ queryKey: ["landing-investors"] }); toast.success("Investor deleted"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      ...(editing?.id ? { id: editing.id } : {}),
      name: fd.get("name") as string,
      country: fd.get("country") as string,
      portfolio_value: fd.get("portfolio_value") as string,
      monthly_profit: fd.get("monthly_profit") as string,
      sort_order: Number(fd.get("sort_order") || 0),
      is_active: true,
      photo_url: editing?.photo_url,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Investors Leaderboard ({investors.length})</h3>
        <Button onClick={() => { setEditing({}); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Investor</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Portfolio</TableHead>
            <TableHead>Monthly Profit</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investors.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.photo_url ? <img src={inv.photo_url} className="w-8 h-8 rounded-full object-cover" /> : "—"}</TableCell>
              <TableCell className="font-medium">{inv.name}</TableCell>
              <TableCell>{inv.country}</TableCell>
              <TableCell>{inv.portfolio_value}</TableCell>
              <TableCell className="text-success">{inv.monthly_profit}</TableCell>
              <TableCell>{inv.sort_order}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(inv); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(inv.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {investors.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No investors yet. Hardcoded defaults will be shown.</TableCell></TableRow>}
        </TableBody>
      </Table>

      <FormDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setPhotoFile(null); } }} title={editing?.id ? "Edit Investor" : "Add Investor"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input name="name" defaultValue={editing?.name} required /></div>
            <div><Label>Country (with flag emoji)</Label><Input name="country" defaultValue={editing?.country} placeholder="🇺🇸 USA" required /></div>
            <div><Label>Portfolio Value</Label><Input name="portfolio_value" defaultValue={editing?.portfolio_value || "$0"} required /></div>
            <div><Label>Monthly Profit</Label><Input name="monthly_profit" defaultValue={editing?.monthly_profit || "$0"} required /></div>
            <div><Label>Sort Order</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} /></div>
          </div>
          <div>
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-3 mt-1">
              {(editing?.photo_url || photoFile) && (
                <img src={photoFile ? URL.createObjectURL(photoFile) : editing?.photo_url!} className="w-12 h-12 rounded-full object-cover" />
              )}
              <label className="cursor-pointer flex items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" />Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Investor"}</Button>
        </form>
      </FormDialog>
    </div>
  );
}

// ── TESTIMONIALS TAB ──
function TestimonialsTab() {
  const qc = useQueryClient();
  const { data: testimonials = [] } = useQuery({ queryKey: ["admin-landing-testimonials"], queryFn: fetchAllTestimonials });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LandingTestimonial> | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async (form: Partial<LandingTestimonial>) => {
      let photo_url = form.photo_url;
      if (photoFile) photo_url = await uploadLandingPhoto(photoFile, "testimonials");
      await upsertTestimonial({ ...form, photo_url } as any);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-landing-testimonials"] }); qc.invalidateQueries({ queryKey: ["landing-testimonials"] }); setOpen(false); setEditing(null); setPhotoFile(null); toast.success("Testimonial saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-landing-testimonials"] }); qc.invalidateQueries({ queryKey: ["landing-testimonials"] }); toast.success("Testimonial deleted"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      ...(editing?.id ? { id: editing.id } : {}),
      name: fd.get("name") as string,
      country: fd.get("country") as string,
      review: fd.get("review") as string,
      rating: Number(fd.get("rating") || 5),
      sort_order: Number(fd.get("sort_order") || 0),
      is_active: true,
      photo_url: editing?.photo_url,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Testimonials ({testimonials.length})</h3>
        <Button onClick={() => { setEditing({}); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Testimonial</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testimonials.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.photo_url ? <img src={t.photo_url} className="w-8 h-8 rounded-full object-cover" /> : "—"}</TableCell>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell>{t.country}</TableCell>
              <TableCell className="max-w-[200px] truncate">{t.review}</TableCell>
              <TableCell>{"⭐".repeat(t.rating)}</TableCell>
              <TableCell>{t.sort_order}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {testimonials.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No testimonials yet. Hardcoded defaults will be shown.</TableCell></TableRow>}
        </TableBody>
      </Table>

      <FormDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setPhotoFile(null); } }} title={editing?.id ? "Edit Testimonial" : "Add Testimonial"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input name="name" defaultValue={editing?.name} required /></div>
            <div><Label>Country (with flag)</Label><Input name="country" defaultValue={editing?.country} placeholder="🇺🇸 USA" required /></div>
            <div><Label>Rating (1-5)</Label><Input name="rating" type="number" min={1} max={5} defaultValue={editing?.rating || 5} required /></div>
            <div><Label>Sort Order</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} /></div>
          </div>
          <div><Label>Review</Label><Textarea name="review" defaultValue={editing?.review} rows={3} required /></div>
          <div>
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-3 mt-1">
              {(editing?.photo_url || photoFile) && (
                <img src={photoFile ? URL.createObjectURL(photoFile) : editing?.photo_url!} className="w-12 h-12 rounded-full object-cover" />
              )}
              <label className="cursor-pointer flex items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" />Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Testimonial"}</Button>
        </form>
      </FormDialog>
    </div>
  );
}

// ── LIVE ACTIVITY TAB ──
function LiveActivityTab() {
  const qc = useQueryClient();
  const SETTINGS_TABLE = "platform_settings" as any;
  
  const { data: settings } = useQuery({
    queryKey: ["landing-activity-config"],
    queryFn: async () => {
      const { data } = await supabase.from(SETTINGS_TABLE).select("*").eq("key", "landing_activity_config").single();
      return (data as any)?.value as { enabled: boolean; frequency_seconds: number } | null;
    },
  });

  const enabled = settings?.enabled ?? true;
  const frequency = settings?.frequency_seconds ?? 7;

  const mutation = useMutation({
    mutationFn: async (val: { enabled: boolean; frequency_seconds: number }) => {
      const { error } = await supabase.from(SETTINGS_TABLE).upsert({
        key: "landing_activity_config",
        value: val,
        description: "Live activity feed settings for landing page",
      } as any, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["landing-activity-config"] }); toast.success("Settings saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-lg">
      <h3 className="text-lg font-semibold">Live Activity Feed</h3>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Activity Feed</p>
              <p className="text-sm text-muted-foreground">Show live trading/deposit activity on landing page</p>
            </div>
            <Switch checked={enabled} onCheckedChange={(checked) => mutation.mutate({ enabled: checked, frequency_seconds: frequency })} />
          </div>
          <div>
            <Label>Update Frequency (seconds)</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="number"
                min={3}
                max={30}
                defaultValue={frequency}
                className="w-24"
                onBlur={(e) => mutation.mutate({ enabled, frequency_seconds: Number(e.target.value) || 7 })}
              />
              <span className="text-sm text-muted-foreground">seconds between updates (3–30)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── MAIN PAGE ──
const AdminLandingContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Landing Page Content</h1>
        <p className="text-muted-foreground">Manage traders, investors, testimonials, and live activity displayed on the homepage.</p>
      </div>

      <Tabs defaultValue="traders">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="traders" className="gap-2"><Users className="h-4 w-4" />Traders</TabsTrigger>
          <TabsTrigger value="investors" className="gap-2"><Trophy className="h-4 w-4" />Investors</TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-2"><MessageSquare className="h-4 w-4" />Reviews</TabsTrigger>
          <TabsTrigger value="activity" className="gap-2"><Activity className="h-4 w-4" />Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="traders"><TradersTab /></TabsContent>
        <TabsContent value="investors"><InvestorsTab /></TabsContent>
        <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
        <TabsContent value="activity"><LiveActivityTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLandingContent;
