import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/firebase";
import { toast } from "sonner";

export function usePushNotifications() {
  const { user } = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    if (!user || registered.current) return;
    registered.current = true;

    (async () => {
      try {
        const token = await requestNotificationPermission();
        if (!token) return;

        // Upsert token to database
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
    })();

    // Listen for foreground messages
    onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      if (title) {
        toast(title, { description: body });
      }
    });
  }, [user]);
}
