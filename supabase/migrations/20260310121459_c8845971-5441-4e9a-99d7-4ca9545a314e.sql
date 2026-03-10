
DROP POLICY "Service can insert profit logs" ON public.profit_logs;

-- Only allow authenticated users to insert their own profit logs (edge function uses service role which bypasses RLS)
CREATE POLICY "Users can insert own profit logs"
  ON public.profit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
