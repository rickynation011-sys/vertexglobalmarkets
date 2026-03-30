import { useState } from "react";
import { Bell, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { NotificationDetailDialog } from "./NotificationDetailDialog";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  notification_id: string;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["user-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: notifs, error } = await supabase
        .from("notifications")
        .select("id, title, message, created_at, target, target_user_id")
        .or(`target.eq.all,target_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(30);

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
          notification_id: n.id,
          is_read: readMap.get(n.id)?.is_read ?? false,
        })) as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;
      const { error } = await supabase.from("user_notifications").upsert(
        {
          user_id: user.id,
          notification_id: notificationId,
          is_read: true,
          read_at: new Date().toISOString(),
        },
        { onConflict: "user_id,notification_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const unread = notifications.filter((n) => !n.is_read);
      for (const n of unread) {
        await supabase.from("user_notifications").upsert(
          {
            user_id: user.id,
            notification_id: n.notification_id,
            is_read: true,
            read_at: new Date().toISOString(),
          },
          { onConflict: "user_id,notification_id" }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;
      // Mark as read and "dismissed" by upserting read status
      await supabase.from("user_notifications").upsert(
        {
          user_id: user.id,
          notification_id: notificationId,
          is_read: true,
          read_at: new Date().toISOString(),
        },
        { onConflict: "user_id,notification_id" }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
    },
  });

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) markReadMutation.mutate(n.notification_id);
    setSelectedNotification({ ...n, is_read: true });
    setDetailOpen(true);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-muted-foreground">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <ScrollArea className="max-h-[60vh] sm:max-h-80" style={{ scrollBehavior: 'smooth' }}>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`relative group w-full text-left px-4 py-3 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/50 ${
                      !n.is_read ? "bg-primary/5" : ""
                    }`}
                  >
                    <button
                      onClick={() => handleNotificationClick(n)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-2 pr-6">
                        {!n.is_read && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                        <div className={!n.is_read ? "" : "pl-4"}>
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotificationMutation.mutate(n.notification_id);
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                      title="Dismiss"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))
              )}
            </ScrollArea>
            {notifications.length > 3 && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-popover to-transparent rounded-b-md" />
            )}
          </div>
        </PopoverContent>
      </Popover>

      <NotificationDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        notification={selectedNotification}
      />
    </>
  );
};
