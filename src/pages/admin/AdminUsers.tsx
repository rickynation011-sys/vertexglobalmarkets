import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Ban, Loader2, CheckCircle, DollarSign, ShieldCheck, Plus, Minus, Trash2, MailCheck, MailX, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type AppRole = Enums<"app_role">;

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  suspended: "bg-warning/10 text-warning",
  banned: "bg-destructive/10 text-destructive",
};

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  moderator: "bg-warning/10 text-warning",
  user: "bg-primary/10 text-primary",
};

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, AppRole[]>>({});
  const [emailVerification, setEmailVerification] = useState<Record<string, { email_confirmed_at: string | null }>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Balance dialog
  const [balanceDialog, setBalanceDialog] = useState<{ open: boolean; user: Profile | null; mode: "credit" | "debit" }>({ open: false, user: null, mode: "credit" });
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Role dialog
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user: Profile | null }>({ open: false, user: null });
  const [newRole, setNewRole] = useState<AppRole>("user");
  const [roleLoading, setRoleLoading] = useState(false);

  const fetchProfiles = async () => {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);

    if (profilesRes.error) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    setProfiles(profilesRes.data ?? []);

    // Build roles map
    const rolesMap: Record<string, AppRole[]> = {};
    for (const r of rolesRes.data ?? []) {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role);
    }
    setUserRoles(rolesMap);
    setLoading(false);

    // Fetch email verification status
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const res = await supabase.functions.invoke("get-email-verification-status");
        if (res.data && !res.error) {
          setEmailVerification(res.data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch email verification status", e);
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const updateStatus = async (userId: string, newStatus: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to update user status");
      return;
    }
    toast.success(`User status updated to ${newStatus}`);
    fetchProfiles();
  };

  const handleBalanceUpdate = async () => {
    if (!balanceDialog.user) return;
    const amt = parseFloat(balanceAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid positive amount");
      return;
    }

    setBalanceLoading(true);
    const currentBalance = Number(balanceDialog.user.wallet_balance ?? 0);
    const newBalance = balanceDialog.mode === "credit"
      ? currentBalance + amt
      : Math.max(0, currentBalance - amt);

    const { error } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("user_id", balanceDialog.user.user_id);

    setBalanceLoading(false);
    if (error) {
      toast.error("Failed to update balance");
      return;
    }

    toast.success(`${balanceDialog.mode === "credit" ? "Credited" : "Debited"} $${amt.toLocaleString()} — New balance: $${newBalance.toLocaleString()}`);
    setBalanceDialog({ open: false, user: null, mode: "credit" });
    setBalanceAmount("");
    fetchProfiles();
  };

  const handleAddRole = async () => {
    if (!roleDialog.user) return;
    setRoleLoading(true);

    const existing = userRoles[roleDialog.user.user_id] ?? [];
    if (existing.includes(newRole)) {
      toast.error("User already has this role");
      setRoleLoading(false);
      return;
    }

    const { error } = await supabase.from("user_roles").insert({
      user_id: roleDialog.user.user_id,
      role: newRole,
    });

    setRoleLoading(false);
    if (error) {
      toast.error("Failed to add role");
      return;
    }
    toast.success(`Added ${newRole} role`);
    fetchProfiles();
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast.error("Failed to remove role");
      return;
    }
    toast.success(`Removed ${role} role`);
    fetchProfiles();
  };

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      (p.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground text-sm">{profiles.length} total users — manage balances, roles & status</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
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
                  <th className="text-left p-4 text-muted-foreground font-medium">Email Verified</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Balance</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Roles</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Country</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">No users found</td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const roles = userRoles[u.user_id] ?? [];
                    return (
                      <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{u.full_name ?? "No name"}</p>
                          <p className="text-xs text-muted-foreground">{u.email ?? "No email"}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={`text-xs ${statusColors[u.status] ?? "bg-muted text-muted-foreground"}`}>{u.status}</Badge>
                        </td>
                        <td className="p-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {emailVerification[u.user_id]?.email_confirmed_at ? (
                                  <Badge className="bg-success/10 text-success text-xs gap-1">
                                    <MailCheck className="h-3 w-3" /> Verified
                                  </Badge>
                                ) : (
                                  <Badge className="bg-warning/10 text-warning text-xs gap-1">
                                    <MailX className="h-3 w-3" /> Unverified
                                  </Badge>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {emailVerification[u.user_id]?.email_confirmed_at
                                  ? `Verified on ${new Date(emailVerification[u.user_id].email_confirmed_at!).toLocaleString()}`
                                  : "Email not yet verified"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="p-4 font-medium text-foreground">
                          ${Number(u.wallet_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {roles.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              roles.map((role) => (
                                <Badge key={role} className={`text-[10px] ${roleColors[role] ?? ""}`}>{role}</Badge>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{u.country ?? "—"}</td>
                        <td className="p-4 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Credit */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success"
                              title="Credit balance"
                              onClick={() => setBalanceDialog({ open: true, user: u, mode: "credit" })}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            {/* Debit */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-warning"
                              title="Debit balance"
                              onClick={() => setBalanceDialog({ open: true, user: u, mode: "debit" })}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            {/* Roles */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              title="Manage roles"
                              onClick={() => setRoleDialog({ open: true, user: u })}
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </Button>
                            {/* Suspend / Activate */}
                            {u.status === "suspended" || u.status === "banned" ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => updateStatus(u.user_id, "active")} title="Activate">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateStatus(u.user_id, "suspended")} title="Suspend">
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Balance Credit/Debit Dialog */}
      <Dialog open={balanceDialog.open} onOpenChange={(open) => { if (!open) { setBalanceDialog({ open: false, user: null, mode: "credit" }); setBalanceAmount(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {balanceDialog.mode === "credit" ? "Credit" : "Debit"} Balance — {balanceDialog.user?.full_name ?? "User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current balance: <span className="font-medium text-foreground">${Number(balanceDialog.user?.wallet_balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </p>
            <div>
              <label className="text-sm text-muted-foreground">Amount (USD)</label>
              <Input type="number" min="0.01" step="0.01" placeholder="Enter amount" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} className="mt-1" />
            </div>
            <div className="flex gap-2">
              {["50", "100", "500", "1000", "5000"].map((amt) => (
                <Button key={amt} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setBalanceAmount(amt)}>${amt}</Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialog({ open: false, user: null, mode: "credit" })}>Cancel</Button>
            <Button
              onClick={handleBalanceUpdate}
              disabled={balanceLoading || !balanceAmount}
              className={balanceDialog.mode === "credit" ? "bg-success text-success-foreground hover:bg-success/90" : "bg-warning text-warning-foreground hover:bg-warning/90"}
            >
              {balanceLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {balanceDialog.mode === "credit" ? "Credit" : "Debit"} ${balanceAmount || "0"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => { if (!open) setRoleDialog({ open: false, user: null }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Roles — {roleDialog.user?.full_name ?? "User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current roles */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Roles</p>
              <div className="flex flex-wrap gap-2">
                {(userRoles[roleDialog.user?.user_id ?? ""] ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No roles assigned</p>
                ) : (
                  (userRoles[roleDialog.user?.user_id ?? ""] ?? []).map((role) => (
                    <div key={role} className="flex items-center gap-1">
                      <Badge className={`${roleColors[role] ?? ""}`}>{role}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveRole(roleDialog.user!.user_id, role)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add role */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Add Role</p>
              <div className="flex gap-2">
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddRole} disabled={roleLoading} size="sm">
                  {roleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
