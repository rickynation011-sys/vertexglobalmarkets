CREATE TABLE public.fcm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);

ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own tokens" ON public.fcm_tokens
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own tokens" ON public.fcm_tokens
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tokens" ON public.fcm_tokens
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all tokens" ON public.fcm_tokens
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_fcm_tokens_updated_at
  BEFORE UPDATE ON public.fcm_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();