import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Bell, Calendar, Clock } from "lucide-react";

interface NotificationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: {
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
  } | null;
}

export const NotificationDetailDialog = ({
  open,
  onOpenChange,
  notification,
}: NotificationDetailDialogProps) => {
  if (!notification) return null;

  const date = new Date(notification.created_at);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-full bg-primary/10 shrink-0">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold text-foreground leading-snug">
                {notification.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <Badge
                  className={`text-[10px] ${
                    notification.is_read
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {notification.is_read ? "Read" : "Unread"}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(date, "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(date, "h:mm a")}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-2 p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {notification.message}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
