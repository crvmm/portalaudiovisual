-- Auto-create app profiles when a new auth user signs up (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_type profile_type;
  v_display_name TEXT;
BEGIN
  v_profile_type := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'profile_type', '')::profile_type,
    'professional'::profile_type
  );

  v_display_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, profile_type, display_name, email)
  VALUES (NEW.id, v_profile_type, v_display_name, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  IF v_profile_type = 'professional' THEN
    INSERT INTO public.professional_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.notification_preferences (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
  ELSIF v_profile_type = 'company' THEN
    INSERT INTO public.company_profiles (id, company_name)
    VALUES (NEW.id, v_display_name)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.individual_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
