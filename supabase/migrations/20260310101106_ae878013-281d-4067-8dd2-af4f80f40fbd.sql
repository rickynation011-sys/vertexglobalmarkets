-- Add unique constraint on platform_settings.key for upsert
ALTER TABLE public.platform_settings
  ADD CONSTRAINT platform_settings_key_unique UNIQUE (key);