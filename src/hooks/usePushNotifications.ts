import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

const PUSH_PROMPT_KEY = "vgm_push_prompt_dismissed";

export function usePushNotifications() {
  const { user } = useAuth();
  const registered = useRef(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!user || registered.current) return;

    // Check if we should show the prompt
    const alreadyDismissed = localStorage.getItem(PUSH_PROMPT_KEY);
    if (
      !alreadyDismissed &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      // Small delay so the dashboard loads first
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    }

    // If already granted, silently register
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      registerToken();
    }
  }, [user]);

  // Always set up foreground listener
  useEffect(() => {
    if (!user) return;
    onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      if (title) toast(title, { description: body });
    });
  }, [user]);

  async function registerToken() {
    if (registered.current || !user) return;
    registered.current = true;
    try {
      const token = await requestNotificationPermission();
      if (!token) return;
      const { error } = await supabase
        .from("fcm_tokens" as any)
        .upsert(
          { user_id: user.id, token, updated_at: new Date().toISOString() },
          { onConflict: "user_id,token" }
        );
      if (error) console.error("Failed to save FCM token:", error);
    } catch (err) {
      console.error("Push notification setup failed:", err);
    }
  }

  function handleEnable() {
    setShowPrompt(false);
    localStorage.setItem(PUSH_PROMPT_KEY, "1");
    registerToken();
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem(PUSH_PROMPT_KEY, "1");
  }

  return { PushPromptDialog: showPrompt ? (
    <Dialog open={showPrompt} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg">Enable Push Notifications</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Stay informed about deposits, withdrawals, trade updates, and important account activity in real time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={handleEnable} className="w-full bg-gradient-brand text-primary-foreground font-semibold">
            <Bell className="mr-2 h-4 w-4" /> Enable Notifications
          </Button>
          <Button variant="ghost" onClick={handleDismiss} className="w-full text-muted-foreground">
            <BellOff className="mr-2 h-4 w-4" /> Not Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null };
}
