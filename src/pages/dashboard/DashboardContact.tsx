import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, Clock, Paperclip, Send, Ticket, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { TicketChatThread } from "@/components/dashboard/TicketChatThread";

const DashboardContact = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("other");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["my-tickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in subject and message.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      let attachment_url: string | null = null;
      if (file) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        attachment_url = filePath;
      }

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        category,
        attachment_url,
        status: "open",
      });
      if (error) throw error;

      // Notify admin (in-app)
      await supabase.from("notifications").insert({
        title: "New Support Ticket",
        message: `New ticket submitted: "${subject.trim()}"`,
        target: "admin",
        channel_in_app: true,
        sent_by: user.id,
      });

      // Notify admin(s) via email
      const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("user_id", user.id).single();
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (adminRoles && adminRoles.length > 0) {
        const { data: adminProfiles } = await supabase.from("profiles").select("email").in("user_id", adminRoles.map((r: any) => r.user_id));
        for (const admin of adminProfiles ?? []) {
          if (admin.email) {
            supabase.functions.invoke('send-transactional-email', {
              body: {
                templateName: 'admin-new-ticket',
                recipientEmail: admin.email,
                idempotencyKey: `admin-ticket-${user.id}-${Date.now()}-${admin.email}`,
                templateData: {
                  userName: prof?.full_name || 'Unknown',
                  userEmail: prof?.email || '',
                  subject: subject.trim(),
                  category,
                  submittedAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      }

      toast.success("Your complaint has been submitted successfully!");
      setSubject("");
      setCategory("other");
      setMessage("");
      setFile(null);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
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
    return true;
  });

  // If a ticket is selected, show chat thread
  if (selectedTicket) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col">
        <TicketChatThread
          ticket={selectedTicket}
          senderType="user"
          onBack={() => {
            setSelectedTicket(null);
            queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Support & Complaints</h1>
          <p className="text-muted-foreground text-sm">Submit a ticket or view your conversations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-brand text-primary-foreground font-semibold">
          <Plus className="h-4 w-4 mr-1.5" />
          New Ticket
        </Button>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Mail, label: "Email Support", value: "support@vertexglobal.com", sub: "Response within 2 hours" },
          { icon: Phone, label: "Phone Support", value: "+1 (800) 555-VRTX", sub: "Mon-Fri, 9AM-6PM EST" },
          { icon: Clock, label: "Live Chat", value: "Available 24/7", sub: "Average wait: 2 min" },
        ].map((item) => (
          <Card key={item.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Ticket Form (collapsible) */}
      {showForm && (
        <Card className="bg-card border-border animate-in slide-in-from-top-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> New Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Subject *</label>
                <Input placeholder="Brief description" className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account Issues</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="deposit">Deposit / Withdrawal</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="kyc">KYC Verification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Message *</label>
              <Textarea placeholder="Describe your issue in detail..." className="mt-1 min-h-[100px]" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Attachment (optional)</label>
              <div className="mt-1">
                <Input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-gradient-brand text-primary-foreground font-semibold" onClick={handleSubmit} disabled={submitting}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 capitalize"
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tickets List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Ticket className="h-4 w-4" /> My Tickets ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
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
                    <p className="text-xs text-muted-foreground truncate">{ticket.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(ticket.last_message_at || ticket.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-[10px] capitalize ${statusColor(ticket.status)}`}>
                      {statusLabel(ticket.status)}
                    </Badge>
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

export default DashboardContact;
