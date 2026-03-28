
-- 1. Fix wallet_balance self-modification: replace broad user UPDATE policy with restricted one
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own non-financial profile fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND wallet_balance = (SELECT p.wallet_balance FROM public.profiles p WHERE p.user_id = auth.uid())
    AND status = (SELECT p.status FROM public.profiles p WHERE p.user_id = auth.uid())
    AND referred_by IS NOT DISTINCT FROM (SELECT p.referred_by FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- 2. Fix user_roles privilege escalation: add restrictive policy blocking non-admin writes
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix referral codes exposure: remove broad SELECT, add RPC for code lookup
DROP POLICY IF EXISTS "Anyone authenticated can look up codes" ON public.referral_codes;

-- Create an RPC for referral code validation (used during registration)
CREATE OR REPLACE FUNCTION public.lookup_referral_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.referral_codes WHERE code = _code LIMIT 1;
$$;

-- 4. Fix profit_logs user insert: remove user insert policy
DROP POLICY IF EXISTS "Users can insert own profit logs" ON public.profit_logs;

-- Add service role insert policy for profit_logs
CREATE POLICY "Service role can insert profit logs"
  ON public.profit_logs FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role'::text);
