
-- Add proof_url column to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS proof_url text DEFAULT NULL;

-- Create deposit-proofs storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('deposit-proofs', 'deposit-proofs', false) ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload their own proofs
CREATE POLICY "Users can upload deposit proofs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'deposit-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can view own proofs
CREATE POLICY "Users can view own deposit proofs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'deposit-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Admins can view all deposit proofs
CREATE POLICY "Admins can view all deposit proofs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'deposit-proofs' AND public.has_role(auth.uid(), 'admin'));
