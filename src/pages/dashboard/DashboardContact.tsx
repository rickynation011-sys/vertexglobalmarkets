import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, Clock, Paperclip, Send, Ticket, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DashboardContact = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("other");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["my-tickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
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
      });
      if (error) throw error;

      toast.success("Your complaint has been submitted successfully!");
      setSubject("");
      setCategory("other");
      setMessage("");
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === "resolved") return "bg-green-500/10 text-green-500";
    if (s === "read") return "bg-blue-500/10 text-blue-500";
    return "bg-yellow-500/10 text-yellow-500";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Support & Complaints</h1>
        <p className="text-muted-foreground text-sm">Submit a ticket or view your existing complaints</p>
      </div>

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

      {/* Submit Ticket Form */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Submit a Ticket / Complaint
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
            <Textarea placeholder="Describe your issue in detail..." className="mt-1 min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Attachment (optional)</label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs"
              />
              {file && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Paperclip className="h-3 w-3" /> {file.name}
                </span>
              )}
            </div>
          </div>
          <Button className="bg-gradient-brand text-primary-foreground font-semibold" onClick={handleSubmit} disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </CardContent>
      </Card>

      {/* My Tickets History */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Ticket className="h-4 w-4" /> My Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket: any) => (
                <button
                  key={ticket.id}
                  onClick={() => { setSelectedTicket(ticket); setDetailOpen(true); }}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{ticket.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(ticket.created_at), "MMM d, yyyy h:mm a")}
                    </p>
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

      {/* Ticket Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={`text-[10px] capitalize ${statusColor(selectedTicket.status)}`}>{selectedTicket.status}</Badge>
                <Badge variant="outline" className="text-[10px] capitalize">{selectedTicket.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(selectedTicket.created_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
              {selectedTicket.attachment_url && (
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Attachment included</span>
                </div>
              )}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardContact;
