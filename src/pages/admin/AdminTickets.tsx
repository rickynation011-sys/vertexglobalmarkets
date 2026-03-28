import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ticket, Eye, Send, Paperclip, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminTickets = () => {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch profile info for each unique user_id
      const userIds = [...new Set(data.map((t: any) => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p: any) => { profileMap[p.user_id] = p; });

      return data.map((t: any) => ({
        ...t,
        user_name: profileMap[t.user_id]?.full_name || "Unknown",
        user_email: profileMap[t.user_id]?.email || "—",
      }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_reply }: { id: string; status?: string; admin_reply?: string }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (admin_reply) {
        updates.admin_reply = admin_reply;
        updates.replied_at = new Date().toISOString();
      }
      const { error } = await supabase.from("support_tickets").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket updated.");
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
    if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status });
  };

  const handleReply = () => {
    if (!reply.trim() || !selectedTicket) return;
    updateMutation.mutate({ id: selectedTicket.id, admin_reply: reply.trim(), status: "resolved" });
    setSelectedTicket({ ...selectedTicket, admin_reply: reply.trim(), status: "resolved", replied_at: new Date().toISOString() });
    setReply("");
  };

  const openDetail = (ticket: any) => {
    setSelectedTicket(ticket);
    setDetailOpen(true);
    setReply("");
    if (ticket.status === "pending") {
      updateMutation.mutate({ id: ticket.id, status: "read" });
    }
  };

  const statusColor = (s: string) => {
    if (s === "resolved") return "bg-green-500/10 text-green-500";
    if (s === "read") return "bg-blue-500/10 text-blue-500";
    return "bg-yellow-500/10 text-yellow-500";
  };

  const filtered = tickets.filter((t: any) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.subject.toLowerCase().includes(q) || t.user_name.toLowerCase().includes(q) || t.user_email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Ticket Complaints</h1>
        <p className="text-muted-foreground text-sm">Manage user support tickets and complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: tickets.length },
          { label: "Pending", value: tickets.filter((t: any) => t.status === "pending").length },
          { label: "Read", value: tickets.filter((t: any) => t.status === "read").length },
          { label: "Resolved", value: tickets.filter((t: any) => t.status === "resolved").length },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by subject, name, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Ticket className="h-4 w-4" /> All Tickets ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading tickets...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((ticket: any) => (
                <button
                  key={ticket.id}
                  onClick={() => openDetail(ticket)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                      {ticket.attachment_url && <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{ticket.user_name} · {ticket.user_email}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(ticket.created_at), "MMM d, yyyy h:mm a")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-[10px] capitalize ${statusColor(ticket.status)}`}>{ticket.status}</Badge>
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              {/* User info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span><strong className="text-foreground">User:</strong> {selectedTicket.user_name}</span>
                <span><strong className="text-foreground">Email:</strong> {selectedTicket.user_email}</span>
                <span><strong className="text-foreground">Date:</strong> {format(new Date(selectedTicket.created_at), "MMM d, yyyy h:mm a")}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={`text-[10px] capitalize ${statusColor(selectedTicket.status)}`}>{selectedTicket.status}</Badge>
                <Badge variant="outline" className="text-[10px] capitalize">{selectedTicket.category}</Badge>
              </div>

              {/* Full message */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
              </div>

              {/* Attachment */}
              {selectedTicket.attachment_url && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{selectedTicket.attachment_url.split("/").pop()}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={async () => {
                      const { data } = await supabase.storage.from("ticket-attachments").createSignedUrl(selectedTicket.attachment_url, 300);
                      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                    }}
                  >
                    View
                  </Button>
                </div>
              )}

              {/* Existing reply */}
              {selectedTicket.admin_reply && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1">Admin Reply</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                  {selectedTicket.replied_at && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(selectedTicket.replied_at), "MMM d, yyyy h:mm a")}
                    </p>
                  )}
                </div>
              )}

              {/* Status Update + Reply */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Select value={selectedTicket.status} onValueChange={(v) => handleStatusChange(selectedTicket.id, v)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Textarea placeholder="Write a reply to the user..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[80px] text-sm" />
                </div>
                <Button size="sm" onClick={handleReply} disabled={!reply.trim() || updateMutation.isPending}>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Reply & Resolve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTickets;
