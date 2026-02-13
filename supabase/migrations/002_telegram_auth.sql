-- =====================================================
-- 002_telegram_auth.sql - Update schema for Telegram Auth
-- =====================================================

-- 1. Add telegram_id column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);

-- 2. Update handle_new_user function to grab telegram_id from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, username, telegram_id, language_code)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'telegram_username', ''), 
    (NEW.raw_user_meta_data->>'telegram_id')::BIGINT,
    'uz'
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.freedom_plans (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
