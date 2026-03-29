
-- Landing page traders
CREATE TABLE public.landing_traders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  flag text NOT NULL DEFAULT '🏳️',
  win_rate numeric NOT NULL DEFAULT 0,
  total_profit text NOT NULL DEFAULT '$0',
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_traders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage landing traders" ON public.landing_traders
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read active landing traders" ON public.landing_traders
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Landing page investors
CREATE TABLE public.landing_investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  portfolio_value text NOT NULL DEFAULT '$0',
  monthly_profit text NOT NULL DEFAULT '$0',
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_investors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage landing investors" ON public.landing_investors
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read active landing investors" ON public.landing_investors
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Landing page testimonials
CREATE TABLE public.landing_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  review text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage landing testimonials" ON public.landing_testimonials
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read active landing testimonials" ON public.landing_testimonials
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Storage bucket for landing page assets
INSERT INTO storage.buckets (id, name, public) VALUES ('landing-assets', 'landing-assets', true);

CREATE POLICY "Admins can upload landing assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'landing-assets' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update landing assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'landing-assets' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete landing assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'landing-assets' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read landing assets" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'landing-assets');
