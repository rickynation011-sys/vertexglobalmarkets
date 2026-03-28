
CREATE TABLE public.signal_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_name text NOT NULL DEFAULT 'Weekly Signals',
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  transaction_id uuid REFERENCES public.transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.signal_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signal subscriptions" ON public.signal_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create signal subscriptions" ON public.signal_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all signal subscriptions" ON public.signal_subscriptions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update signal subscriptions" ON public.signal_subscriptions
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
