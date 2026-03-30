import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { NotificationDetailDialog } from "@/components/dashboard/NotificationDetailDialog";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const DashboardNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["all-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: notifs, error } = await supabase
        .from("notifications")
        .select("id, title, message, created_at")
        .or(`target.eq.all,target_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: readStatuses } = await supabase
        .from("user_notifications")
        .select("notification_id, is_read, is_dismissed")
        .eq("user_id", user.id);

      const readMap = new Map(readStatuses?.map((r: any) => [r.notification_id, { is_read: r.is_read, is_dismissed: r.is_dismissed }]) || []);

      return (notifs || [])
        .filter((n) => !(readMap.get(n.id)?.is_dismissed))
        .map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          created_at: n.created_at,
          is_read: readMap.get(n.id)?.is_read ?? false,
        })) as Notification[];
    },
    enabled: !!user,
  });

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
        queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_notifications", filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
        queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!user) return;
      for (const id of ids) {
        await supabase.from("user_notifications").upsert(
          { user_id: user.id, notification_id: id, is_read: true, read_at: new Date().toISOString() },
          { onConflict: "user_id,notification_id" }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      setSelectedIds(new Set());
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((n) => n.id)));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-32 h-9">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
                markReadMutation.mutate(unreadIds);
              }}
              disabled={markReadMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (!user) return;
                for (const n of notifications) {
                  await supabase.from("user_notifications").upsert(
                    { user_id: user.id, notification_id: n.id, is_read: true, read_at: new Date().toISOString(), is_dismissed: true } as any,
                    { onConflict: "user_id,notification_id" }
                  );
                }
                queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
                queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => markReadMutation.mutate(Array.from(selectedIds))}
            disabled={markReadMutation.isPending}
          >
            Mark selected as read
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" /> All Notifications
            </CardTitle>
            {filtered.length > 0 && (
              <button onClick={selectAll} className="text-xs text-primary hover:underline">
                {selectedIds.size === filtered.length ? "Deselect all" : "Select all"}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {filter === "unread" ? "No unread notifications" : filter === "read" ? "No read notifications" : "No notifications yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border max-h-[60vh] sm:max-h-[600px] overflow-y-auto scroll-smooth pr-1">
                {filtered.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 ${
                      !n.is_read ? "bg-primary/5" : ""
                    }`}
                  >
                    <Checkbox
                      checked={selectedIds.has(n.id)}
                      onCheckedChange={() => toggleSelect(n.id)}
                      className="mt-1"
                    />
                    <button
                      className="flex-1 text-left"
                      onClick={() => {
                        if (!n.is_read) markReadMutation.mutate([n.id]);
                        setSelectedNotification({ ...n, is_read: true });
                        setDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        <p className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"} text-foreground`}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground/70">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-muted-foreground/50">
                          {format(new Date(n.created_at), "MMM d, yyyy · h:mm a")}
                        </span>
                      </div>
                    </button>
                    {!n.is_read && (
                      <Badge className="bg-primary/10 text-primary text-[10px] shrink-0">New</Badge>
                    )}
                  </div>
                ))}
              </div>
              {filtered.length > 5 && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent rounded-b-md" />
              )}
            </>
          )}
        </CardContent>
      </Card>
      <NotificationDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        notification={selectedNotification}
      />
    </div>
  );
};

export default DashboardNotifications;
