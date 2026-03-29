-- Fix: Allow users to update their own FCM tokens (e.g. token refresh)
CREATE POLICY "Users can update own tokens"
ON public.fcm_tokens
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix: Allow service role to insert user_notifications (for edge functions/triggers)
CREATE POLICY "Service role can insert user_notifications"
ON public.user_notifications
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role'::text);

-- Fix: Allow service role to read notifications (for edge functions)
CREATE POLICY "Service role can read notifications"
ON public.notifications
FOR SELECT
TO public
USING (auth.role() = 'service_role'::text);

-- Fix: Allow service role to insert notifications (for triggers/edge functions)
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role'::text);