import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Paperclip, Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { TicketChatThread } from "@/components/dashboard/TicketChatThread";

const AdminTickets = () => {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) throw error;

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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("support_tickets").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Status updated.");
    },
  });

  const handleStatusChange = (status: string) => {
    if (!selectedTicket) return;
    updateStatusMutation.mutate({ id: selectedTicket.id, status });
    setSelectedTicket({ ...selectedTicket, status });
  };

  const statusColor = (s: string) => {
    if (s === "resolved") return "bg-green-500/10 text-green-500";
    if (s === "closed") return "bg-red-500/10 text-red-500";
    if (s === "in_progress") return "bg-blue-500/10 text-blue-500";
    return "bg-yellow-500/10 text-yellow-500";
  };

  const statusLabel = (s: string) => {
    if (s === "in_progress") return "In Progress";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const filtered = tickets.filter((t: any) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.subject.toLowerCase().includes(q) || t.user_name.toLowerCase().includes(q) || t.user_email.toLowerCase().includes(q);
    }
    return true;
  });

  // Chat view for selected ticket
  if (selectedTicket) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col">
        <TicketChatThread
          ticket={selectedTicket}
          senderType="admin"
          onBack={() => {
            setSelectedTicket(null);
            queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
          }}
          onStatusChange={handleStatusChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Ticket Complaints</h1>
        <p className="text-muted-foreground text-sm">Manage user support tickets and conversations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: tickets.length },
          { label: "Open", value: tickets.filter((t: any) => t.status === "open").length },
          { label: "In Progress", value: tickets.filter((t: any) => t.status === "in_progress").length },
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
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
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                      {ticket.attachment_url && <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{ticket.user_name} · {ticket.user_email}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.last_message_at || ticket.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-[10px] capitalize ${statusColor(ticket.status)}`}>{statusLabel(ticket.status)}</Badge>
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTickets;
