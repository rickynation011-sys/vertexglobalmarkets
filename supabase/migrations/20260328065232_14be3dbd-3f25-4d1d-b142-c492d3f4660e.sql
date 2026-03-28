
-- Add currency and referred_by to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid;

-- Referral codes table
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code" ON public.referral_codes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral codes" ON public.referral_codes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone authenticated can look up codes" ON public.referral_codes
  FOR SELECT TO authenticated USING (true);

-- Referrals tracking table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  bonus_amount numeric NOT NULL DEFAULT 0,
  bonus_currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  triggered_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals as referrer" ON public.referrals
  FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update referrals" ON public.referrals
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service and admins can insert referrals" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (true);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  attempts int := 0;
BEGIN
  LOOP
    new_code := 'VGM' || LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0');
    BEGIN
      INSERT INTO public.referral_codes (user_id, code) VALUES (NEW.user_id, new_code);
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      attempts := attempts + 1;
      IF attempts > 10 THEN
        new_code := 'VGM' || LPAD(FLOOR(RANDOM() * 10000000)::text, 7, '0');
        INSERT INTO public.referral_codes (user_id, code) VALUES (NEW.user_id, new_code);
        EXIT;
      END IF;
    END;
  END LOOP;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code on new profile
CREATE TRIGGER on_profile_created_generate_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();
