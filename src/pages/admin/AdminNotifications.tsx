import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Send, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminNotifications = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [channelPush, setChannelPush] = useState(false);
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelEmail, setChannelEmail] = useState(false);
  const [category, setCategory] = useState("");

  // Fetch all profiles for individual user selection
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch notification history
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Array<{
        id: string;
        title: string;
        message: string;
        target: string;
        target_user_id: string | null;
        channel_push: boolean;
        channel_in_app: boolean;
        channel_email: boolean;
        status: string;
        created_at: string;
        sent_by: string | null;
      }>;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !message.trim() || !target) {
        throw new Error("Please fill in all required fields");
      }
      if (target === "individual" && !targetUserId) {
        throw new Error("Please select a user");
      }

      const { data: { user } } = await supabase.auth.getUser();

      // 1. Insert notification record
      const { data: notifData, error } = await supabase.from("notifications").insert({
        title: title.trim(),
        message: message.trim(),
        target,
        target_user_id: target === "individual" ? targetUserId : null,
        channel_push: channelPush,
        channel_in_app: channelInApp,
        channel_email: channelEmail,
        status: "sent",
        sent_by: user?.id || null,
      }).select("id").single();
      if (error) throw error;

      // 2. Determine target user IDs for push, email, and in-app
      let targetUserIds: string[] = [];
      let allProfilesData: Array<{ user_id: string; email: string | null; full_name: string | null }> = [];
      if (target === "individual" && targetUserId) {
        targetUserIds = [targetUserId];
        const { data } = await supabase
          .from("profiles")
          .select("user_id, email, full_name")
          .eq("user_id", targetUserId);
        if (data) allProfilesData = data;
      } else {
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("user_id, email, full_name");
        if (allProfiles) {
          allProfilesData = allProfiles;
          targetUserIds = allProfiles.map((p) => p.user_id);
        }
      }

      // 2b. Create user_notifications records for in-app delivery
      if (channelInApp && notifData?.id && targetUserIds.length > 0) {
        const userNotifRecords = targetUserIds.map((uid) => ({
          user_id: uid,
          notification_id: notifData.id,
        }));
        // Insert in batches of 50
        for (let i = 0; i < userNotifRecords.length; i += 50) {
          await supabase.from("user_notifications").insert(userNotifRecords.slice(i, i + 50));
        }
      }

      // 3. Send push notifications if enabled
      if (channelPush && targetUserIds.length > 0) {
        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              title: title.trim(),
              body: message.trim(),
              userIds: targetUserIds,
              ...(category && category !== "none" ? { category } : {}),
            },
          });
        } catch (pushErr) {
          console.error("Push notification failed:", pushErr);
        }
      }

      // 4. Send email notifications if enabled
      if (channelEmail) {
        let recipients: Array<{ email: string; full_name: string | null }> = [];

        if (target === "individual" && targetUserId) {
          const { data } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("user_id", targetUserId)
            .single();
          if (data?.email) recipients.push(data);
        } else {
          const { data } = await supabase
            .from("profiles")
            .select("email, full_name")
            .not("email", "is", null);
          if (data) recipients = data.filter((p) => p.email);
        }

        const batchSize = 10;
        for (let i = 0; i < recipients.length; i += batchSize) {
          const batch = recipients.slice(i, i + batchSize);
          await Promise.all(
            batch.map((recipient) =>
              supabase.functions.invoke("send-transactional-email", {
                body: {
                  templateName: "admin-notification",
                  recipientEmail: recipient.email,
                  templateData: {
                    title: title.trim(),
                    message: message.trim(),
                    recipientName: recipient.full_name || "Valued Client",
                  },
                },
              })
            )
          );
        }
      }
    },
    onSuccess: () => {
      toast.success("Notification sent successfully");
      setTitle("");
      setMessage("");
      setTarget("");
      setTargetUserId("");
      setChannelPush(false);
      setChannelInApp(true);
      setChannelEmail(false);
      setCategory("");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: () => toast.error("Failed to delete notification"),
  });

  const getTargetLabel = (t: string, userId: string | null) => {
    if (t === "individual" && userId) {
      const p = profiles?.find((p) => p.user_id === userId);
      return p ? (p.full_name || p.email || "User") : "Individual User";
    }
    const map: Record<string, string> = {
      all: "All Users",
      active: "Active Traders",
      inactive: "Inactive Users",
      unverified: "Unverified Users",
      vip: "VIP Users",
    };
    return map[t] || t;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm">Send and manage platform notifications</p>
      </div>

      {/* Send new notification */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Send className="h-4 w-4" /> Send Notification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Title</label>
              <Input
                placeholder="Notification title"
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Target Audience</label>
              <Select value={target} onValueChange={(v) => { setTarget(v); setTargetUserId(""); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Traders</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                  <SelectItem value="unverified">Unverified Users</SelectItem>
                  <SelectItem value="vip">VIP Users</SelectItem>
                  <SelectItem value="individual">Individual User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Individual user selector */}
          {target === "individual" && (
            <div>
              <label className="text-sm text-muted-foreground">Select User</label>
              <Select value={targetUserId} onValueChange={setTargetUserId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((p) => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      {p.full_name || "No name"} — {p.email || "No email"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Category (for preference filtering)</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="trade_executed">Trade Executed</SelectItem>
                  <SelectItem value="deposit_withdrawal">Deposit / Withdrawal</SelectItem>
                  <SelectItem value="market_news">Market News</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Message</label>
              <Textarea
                placeholder="Write your notification message..."
                className="mt-1 min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={channelPush} onCheckedChange={setChannelPush} /> Push notification
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={channelInApp} onCheckedChange={setChannelInApp} /> In-app notification
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={channelEmail} onCheckedChange={setChannelEmail} /> Email
              </label>
            </div>
            <Button
              className="bg-gradient-brand text-primary-foreground font-semibold gap-2"
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Notification History</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !notifications?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications sent yet</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      To: {getTargetLabel(n.target, n.target_user_id)} •{" "}
                      {new Date(n.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-success/10 text-success">{n.status}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteMutation.mutate(n.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
