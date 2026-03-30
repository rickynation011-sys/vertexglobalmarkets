
-- Create a dedicated private storage bucket for fee payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('fee-proofs', 'fee-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload their own fee proofs
CREATE POLICY "Users can upload fee proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'fee-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can view their own fee proofs
CREATE POLICY "Users can view own fee proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'fee-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Admins can view all fee proofs
CREATE POLICY "Admins can view all fee proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'fee-proofs' AND public.has_role(auth.uid(), 'admin'));

-- Enable realtime for fee_payments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.fee_payments;
