ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS last_profit_processed_date date;