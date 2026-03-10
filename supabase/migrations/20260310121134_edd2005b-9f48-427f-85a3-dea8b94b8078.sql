
-- Table for admin-managed crypto deposit wallet addresses
CREATE TABLE public.deposit_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency TEXT NOT NULL,
  network TEXT,
  wallet_address TEXT NOT NULL,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deposit_methods ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active deposit methods
CREATE POLICY "Anyone can read active deposit methods"
  ON public.deposit_methods FOR SELECT TO authenticated
  USING (is_active = true);

-- Only admins can manage deposit methods
CREATE POLICY "Admins can manage deposit methods"
  ON public.deposit_methods FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add wallet_balance to profiles for profit tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC NOT NULL DEFAULT 0;

-- Add daily_rate to investments for profit calculation
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS daily_rate NUMERIC NOT NULL DEFAULT 0;

-- Profit log table
CREATE TABLE public.profit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profit logs"
  ON public.profit_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profit logs"
  ON public.profit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
