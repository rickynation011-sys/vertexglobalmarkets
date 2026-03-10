CREATE TABLE public.profit_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processed_count integer NOT NULL DEFAULT 0,
  total_profit numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  triggered_by text DEFAULT 'manual',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profit_processing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view processing logs" ON public.profit_processing_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert processing logs" ON public.profit_processing_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));