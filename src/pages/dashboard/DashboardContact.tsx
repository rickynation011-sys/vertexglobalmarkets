import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, Clock, Paperclip, Send, Ticket, Plus, ExternalLink } from "lucide-react";
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

      {/* Support Center Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="bg-card border-primary/30 ring-1 ring-primary/20 cursor-pointer hover:border-primary/60 transition-all hover:shadow-md"
          onClick={() => setShowForm(true)}
        >
          <CardContent className="p-5 flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Open Ticket</p>
              <p className="text-xs text-muted-foreground mt-1">Best for detailed issues and tracking</p>
            </div>
          </CardContent>
        </Card>

        <a href="https://wa.me/18005555555" target="_blank" rel="noopener noreferrer" className="block">
          <Card className="bg-card border-border cursor-pointer hover:border-[#25D366]/50 transition-all hover:shadow-md h-full">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="#25D366" className="h-6 w-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 justify-center">Chat on WhatsApp <ExternalLink className="h-3 w-3" /></p>
                <p className="text-xs text-muted-foreground mt-1">Quick response for urgent help</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="https://t.me/vertexglobalmarkets" target="_blank" rel="noopener noreferrer" className="block">
          <Card className="bg-card border-border cursor-pointer hover:border-[#229ED9]/50 transition-all hover:shadow-md h-full">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#229ED9]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="#229ED9" className="h-6 w-6">
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 justify-center">Contact via Telegram <ExternalLink className="h-3 w-3" /></p>
                <p className="text-xs text-muted-foreground mt-1">Alternative support channel</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Mail, label: "Email Support", value: "support@vertexglobalmarkets.com", sub: "Response within 2 hours" },
          { icon: Phone, label: "Phone Support", value: "+1 (800) 555-VRTX", sub: "Mon-Fri, 9AM-6PM EST" },
          { icon: Clock, label: "Live Chat", value: "Available 24/7", sub: "Via ticket system" },
        ].map((item) => (
          <Card key={item.label} className="bg-card border-border">
            <CardContent className="p-3 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.sub}</p>
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
