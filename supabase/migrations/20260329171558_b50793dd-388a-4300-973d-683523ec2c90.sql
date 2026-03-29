
-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  trade_executed_in_app boolean NOT NULL DEFAULT true,
  trade_executed_email boolean NOT NULL DEFAULT true,
  trade_executed_push boolean NOT NULL DEFAULT true,
  deposit_withdrawal_in_app boolean NOT NULL DEFAULT true,
  deposit_withdrawal_email boolean NOT NULL DEFAULT true,
  deposit_withdrawal_push boolean NOT NULL DEFAULT true,
  market_news_in_app boolean NOT NULL DEFAULT true,
  market_news_email boolean NOT NULL DEFAULT true,
  market_news_push boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view own preferences
CREATE POLICY "Users can view own notification preferences"
ON public.notification_preferences FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can update own preferences
CREATE POLICY "Users can update own notification preferences"
ON public.notification_preferences FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Users can insert own preferences
CREATE POLICY "Users can insert own notification preferences"
ON public.notification_preferences FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all notification preferences"
ON public.notification_preferences FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Auto-create preferences for new users via trigger on profiles
CREATE OR REPLACE FUNCTION public.create_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_notification_prefs
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_notification_preferences();

-- Backfill existing users (all defaults are true)
INSERT INTO public.notification_preferences (user_id)
SELECT user_id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
