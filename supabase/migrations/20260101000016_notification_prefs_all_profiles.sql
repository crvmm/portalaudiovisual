-- Create notification preferences for company and individual accounts too.

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
  ELSIF v_profile_type = 'company' THEN
    INSERT INTO public.company_profiles (id, company_name)
    VALUES (NEW.id, v_display_name)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.individual_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.notification_preferences (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

INSERT INTO public.notification_preferences (profile_id)
SELECT p.id
FROM public.profiles p
LEFT JOIN public.notification_preferences np ON np.profile_id = p.id
WHERE np.profile_id IS NULL;
