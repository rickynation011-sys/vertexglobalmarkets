
-- 1. Users can update own support tickets (e.g. reset unread_count)
CREATE POLICY "Users can update own tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Admin can update trades (manage/close trades)
CREATE POLICY "Admins can update trades"
ON public.trades
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Admin can update investments (status changes, value updates)
CREATE POLICY "Admins can update investments"
ON public.investments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Service role can update investments (for profit processing edge function)
CREATE POLICY "Service role can update investments"
ON public.investments
FOR UPDATE
TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- 5. Service role can update profiles (for profit processing - wallet_balance)
CREATE POLICY "Service role can update profiles"
ON public.profiles
FOR UPDATE
TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- 6. Admin can insert notifications (explicit, in addition to ALL policy)
-- Already covered by ALL policy, skip

-- 7. Service role can insert into fee_payments (for edge functions if needed)
CREATE POLICY "Service role can manage fee_payments"
ON public.fee_payments
FOR ALL
TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);
