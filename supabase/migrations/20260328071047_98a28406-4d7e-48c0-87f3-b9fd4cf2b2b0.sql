-- Generate codes for any existing users who don't have one
INSERT INTO public.referral_codes (user_id, code)
SELECT p.user_id, 'VGM' || LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0')
FROM public.profiles p
LEFT JOIN public.referral_codes rc ON rc.user_id = p.user_id
WHERE rc.id IS NULL
ON CONFLICT DO NOTHING;