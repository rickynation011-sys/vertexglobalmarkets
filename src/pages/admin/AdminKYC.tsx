import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, Search, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type KYC = Tables<"kyc_verifications"> & { profile?: { full_name: string | null; email: string | null } | null };

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const AdminKYC = () => {
  const { user } = useAuth();
  const [kycList, setKycList] = useState<KYC[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKYC = async () => {
    const { data: kycData } = await supabase
      .from("kyc_verifications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (!kycData) { setLoading(false); return; }

    // Fetch profiles for all user_ids
    const userIds = [...new Set(kycData.map((k) => k.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    const profileMap = new Map((profilesData ?? []).map((p) => [p.user_id, p]));

    const enriched: KYC[] = kycData.map((k) => ({
      ...k,
      profile: profileMap.get(k.user_id) ?? null,
    }));

    setKycList(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchKYC();
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(true);
    const { error } = await supabase
      .from("kyc_verifications")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id ?? null,
        reviewer_notes: reviewNotes || null,
      })
      .eq("id", id);

    if (error) {
      toast.error(`Failed to ${status} KYC`);
    } else {
      toast.success(`KYC ${status} successfully`);
      setReviewNotes("");
      setSelected(null);
      fetchKYC();
    }
    setActionLoading(false);
  };

  const filtered = kycList.filter((k) => {
    const matchesFilter = filter === "all" || k.status === filter;
    const name = k.profile?.full_name ?? "";
    const email = k.profile?.email ?? "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selectedKYC = kycList.find((k) => k.id === selected);

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
        <h1 className="text-2xl font-display font-bold text-foreground">KYC Verification</h1>
        <p className="text-muted-foreground text-sm">Review and approve identity verifications</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending", count: kycList.filter((k) => k.status === "pending").length, icon: Clock, color: "text-warning" },
          { label: "Approved", count: kycList.filter((k) => k.status === "approved").length, icon: CheckCircle, color: "text-success" },
          { label: "Rejected", count: kycList.filter((k) => k.status === "rejected").length, icon: XCircle, color: "text-destructive" },
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
          <Input placeholder="Search submissions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No KYC submissions found</td></tr>
                  ) : (
                    filtered.map((kyc) => (
                      <tr key={kyc.id} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${selected === kyc.id ? "bg-muted/50" : ""}`} onClick={() => setSelected(kyc.id)}>
                        <td className="p-4">
                          <p className="font-medium text-foreground">{kyc.profile?.full_name ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{kyc.profile?.email ?? kyc.user_id}</p>
                        </td>
                        <td className="p-4 text-muted-foreground">{kyc.document_type}</td>
                        <td className="p-4 text-muted-foreground text-xs">{new Date(kyc.submitted_at).toLocaleDateString()}</td>
                        <td className="p-4"><Badge className={`text-xs ${statusColors[kyc.status]}`}>{kyc.status}</Badge></td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {kyc.status === "pending" && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={(e) => { e.stopPropagation(); handleAction(kyc.id, "approved"); }}><CheckCircle className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleAction(kyc.id, "rejected"); }}><XCircle className="h-4 w-4" /></Button>
                              </>
                            )}
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

        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Review Panel</h3>
            {selectedKYC ? (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">User</span><span className="text-foreground">{selectedKYC.profiles?.full_name ?? "Unknown"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground">{selectedKYC.profiles?.email ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Document</span><span className="text-foreground">{selectedKYC.document_type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span className="text-foreground">{new Date(selectedKYC.submitted_at).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={`text-xs ${statusColors[selectedKYC.status]}`}>{selectedKYC.status}</Badge></div>
                  {selectedKYC.reviewer_notes && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span className="text-foreground">{selectedKYC.reviewer_notes}</span></div>
                  )}
                </div>
                {selectedKYC.document_url && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border text-center text-xs text-muted-foreground">
                    <a href={selectedKYC.document_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Document</a>
                  </div>
                )}
                {selectedKYC.status === "pending" && (
                  <>
                    <Textarea placeholder="Reviewer notes (optional)..." className="text-sm" value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-success text-primary-foreground font-semibold" size="sm" disabled={actionLoading} onClick={() => handleAction(selectedKYC.id, "approved")}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button className="flex-1" variant="destructive" size="sm" disabled={actionLoading} onClick={() => handleAction(selectedKYC.id, "rejected")}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
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
