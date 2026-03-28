
-- Fix overly permissive INSERT policy on referrals
DROP POLICY IF EXISTS "Service and admins can insert referrals" ON public.referrals;
CREATE POLICY "Users can create own referral record" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = referred_user_id);

-- Fix function search paths
ALTER FUNCTION public.generate_referral_code() SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
