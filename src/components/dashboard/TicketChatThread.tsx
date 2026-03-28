import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface TicketChatThreadProps {
  ticket: any;
  senderType: "user" | "admin";
  onBack: () => void;
  onStatusChange?: (status: string) => void;
}

export const TicketChatThread = ({ ticket, senderType, onBack, onStatusChange }: TicketChatThreadProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<any>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["ticket-messages", ticket.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!ticket.id,
  });

  // Realtime subscription for messages + typing via broadcast
  useEffect(() => {
    const channel = supabase
      .channel(`ticket-chat-${ticket.id}`, { config: { broadcast: { self: false } } })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${ticket.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticket.id] });
        }
      )
      .on("broadcast", { event: "typing" }, (payload: any) => {
        if (payload.payload?.sender_type !== senderType) {
          setOtherTyping(true);
          // Clear after 3 seconds of no typing events
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [ticket.id, queryClient, senderType]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  // Broadcast typing indicator
  const broadcastTyping = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { sender_type: senderType },
    });
  }, [senderType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    broadcastTyping();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    if (!user) return;
    setSending(true);

    try {
      let attachment_url: string | null = null;
      if (file) {
        const filePath = `${user.id}/${ticket.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        attachment_url = filePath;
      }

      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        sender_type: senderType,
        message: newMessage.trim() || (file ? `📎 ${file.name}` : ""),
        attachment_url,
      });
      if (error) throw error;

      // Update last_message_at on ticket
      await supabase.from("support_tickets").update({
        last_message_at: new Date().toISOString(),
      }).eq("id", ticket.id);

      setNewMessage("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticket.id] });

      // Create in-app notification
      if (senderType === "user") {
        await supabase.from("notifications").insert({
          title: "New Ticket Message",
          message: `User replied to ticket: "${ticket.subject}"`,
          target: "admin",
          channel_in_app: true,
          sent_by: user.id,
        });
      } else {
        await supabase.from("notifications").insert({
          title: "Support Reply",
          message: `Support replied to your ticket: "${ticket.subject}"`,
          target: "user",
          target_user_id: ticket.user_id,
          channel_in_app: true,
          sent_by: user.id,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const otherLabel = senderType === "user" ? "Support" : (ticket.user_name || "User");

  // Build combined timeline: initial message + chat messages
  const allMessages = [
    {
      id: "initial",
      sender_type: "user",
      sender_id: ticket.user_id,
      message: ticket.message,
      attachment_url: ticket.attachment_url,
      created_at: ticket.created_at,
    },
    ...messages,
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-card shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{ticket.subject}</p>
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] capitalize ${statusColor(ticket.status)}`}>
              {statusLabel(ticket.status)}
            </Badge>
            <span className="text-[10px] text-muted-foreground capitalize">{ticket.category}</span>
            {senderType === "admin" && ticket.user_name && (
              <span className="text-[10px] text-muted-foreground">· {ticket.user_name}</span>
            )}
          </div>
        </div>
        {senderType === "admin" && onStatusChange && (
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        )}
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ minHeight: 0 }}
      >
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center">Loading messages...</p>
        ) : (
          allMessages.map((msg: any) => {
            const isOwn = senderType === msg.sender_type;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                    isOwn
                      ? "bg-primary/15 border border-primary/20 rounded-br-sm"
                      : "bg-muted/50 border border-border rounded-bl-sm"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-medium ${isOwn ? "text-primary" : "text-accent"}`}>
                      {msg.sender_type === "admin" ? "Support" : senderType === "admin" ? (ticket.user_name || "User") : "You"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  {msg.attachment_url && (
                    <button
                      onClick={async () => {
                        const { data } = await supabase.storage.from("ticket-attachments").createSignedUrl(msg.attachment_url, 300);
                        if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                      }}
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Paperclip className="h-3 w-3" />
                      {msg.attachment_url.split("/").pop()}
                    </button>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(new Date(msg.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-accent">{otherLabel}</span>
                <span className="text-xs text-muted-foreground">is typing</span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {ticket.status !== "closed" && (
        <div className="p-3 border-t border-border bg-card shrink-0">
          {file && (
            <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              <span className="truncate flex-1">{file.name}</span>
              <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-destructive hover:text-destructive/80">✕</button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Textarea
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[38px] max-h-[120px] resize-none text-sm"
              rows={1}
            />
            <Button
              size="icon"
              className="shrink-0 h-9 w-9 bg-primary hover:bg-primary/90"
              onClick={sendMessage}
              disabled={sending || (!newMessage.trim() && !file)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {ticket.status === "closed" && (
        <div className="p-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">This ticket is closed.</p>
        </div>
      )}
    </div>
  );
};
