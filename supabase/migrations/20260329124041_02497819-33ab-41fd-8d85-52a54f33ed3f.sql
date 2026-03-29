
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1;

ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
