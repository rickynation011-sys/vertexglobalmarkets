ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profit_balance numeric NOT NULL DEFAULT 0;

UPDATE public.profiles AS p
SET profit_balance = COALESCE(src.total_profit, 0)
FROM (
  SELECT user_id, SUM(amount)::numeric AS total_profit
  FROM public.profit_logs
  GROUP BY user_id
) AS src
WHERE p.user_id = src.user_id;

UPDATE public.profiles
SET profit_balance = 0
WHERE profit_balance IS NULL;

CREATE OR REPLACE FUNCTION public.sync_profile_profit_balance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET profit_balance = COALESCE(
      (SELECT SUM(amount)::numeric FROM public.profit_logs WHERE user_id = OLD.user_id),
      0
    )
    WHERE user_id = OLD.user_id;

    RETURN OLD;
  END IF;

  UPDATE public.profiles
  SET profit_balance = COALESCE(
    (SELECT SUM(amount)::numeric FROM public.profit_logs WHERE user_id = NEW.user_id),
    0
  )
  WHERE user_id = NEW.user_id;

  IF TG_OP = 'UPDATE' AND OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    UPDATE public.profiles
    SET profit_balance = COALESCE(
      (SELECT SUM(amount)::numeric FROM public.profit_logs WHERE user_id = OLD.user_id),
      0
    )
    WHERE user_id = OLD.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_profit_balance_on_profit_logs ON public.profit_logs;

CREATE TRIGGER sync_profile_profit_balance_on_profit_logs
AFTER INSERT OR UPDATE OR DELETE ON public.profit_logs
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_profit_balance();

DROP POLICY IF EXISTS "Users can update own non-financial profile fields" ON public.profiles;

CREATE POLICY "Users can update own non-financial profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  (auth.uid() = user_id)
  AND (wallet_balance = (
    SELECT p.wallet_balance
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  ))
  AND (profit_balance = (
    SELECT p.profit_balance
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  ))
  AND (status = (
    SELECT p.status
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  ))
  AND (NOT (referred_by IS DISTINCT FROM (
    SELECT p.referred_by
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  )))
);