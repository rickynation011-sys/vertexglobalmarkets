
-- 1. Fix investments: remove user UPDATE policy entirely (only service-role/admin should update)
DROP POLICY IF EXISTS "Users can update own investments" ON public.investments;

-- 2. Fix referrals: replace INSERT policy with one that validates referrer and prevents self-referral
DROP POLICY IF EXISTS "Users can create own referral record" ON public.referrals;

CREATE POLICY "Users can create validated referral record"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = referred_user_id
    AND referrer_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.referral_codes
      WHERE user_id = referrals.referrer_id
    )
  );
