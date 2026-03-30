
CREATE POLICY "Users can delete own user_notifications"
ON public.user_notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

ALTER TABLE public.user_notifications DROP COLUMN IF EXISTS is_dismissed;
