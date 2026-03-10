
-- Allow service role (edge function) to insert profit logs - already covered by service role bypassing RLS
-- Add insert policy for profit_logs for completeness
CREATE POLICY "Service can insert profit logs"
  ON public.profit_logs FOR INSERT
  WITH CHECK (true);
