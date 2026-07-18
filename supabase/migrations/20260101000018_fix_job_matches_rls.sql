-- Publishing a job triggers match recomputation and notifications.
-- Those functions write to RLS-protected tables as the job author, so they must bypass RLS.

CREATE OR REPLACE FUNCTION public.recompute_job_matches(p_job_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prof RECORD;
  v_match RECORD;
BEGIN
  DELETE FROM job_matches WHERE job_posting_id = p_job_id;

  FOR v_prof IN
    SELECT pp.id
    FROM professional_profiles pp
    JOIN profiles p ON p.id = pp.id
    WHERE p.is_active = TRUE AND pp.is_available = TRUE
  LOOP
    SELECT * INTO v_match FROM compute_job_match(p_job_id, v_prof.id);

    IF v_match.match_score >= 40 THEN
      INSERT INTO job_matches (
        job_posting_id, professional_id, match_score, match_explanation,
        category_score, location_score, availability_score,
        experience_score, budget_score, modality_score, tools_score
      ) VALUES (
        p_job_id, v_prof.id, v_match.match_score, v_match.match_explanation,
        v_match.category_score, v_match.location_score, v_match.availability_score,
        v_match.experience_score, v_match.budget_score, v_match.modality_score, v_match.tools_score
      );
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_job_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job job_postings%ROWTYPE;
  v_explanation_text TEXT;
BEGIN
  SELECT * INTO v_job FROM job_postings WHERE id = NEW.job_posting_id;

  SELECT string_agg(elem->>'message', '. ')
  INTO v_explanation_text
  FROM jsonb_array_elements(NEW.match_explanation) AS elem
  WHERE (elem->>'positive')::boolean = true;

  IF NEW.match_score >= 60 AND NOT NEW.is_notified THEN
    INSERT INTO notifications (
      profile_id,
      channel,
      title,
      body,
      link_url,
      job_posting_id,
      match_score,
      match_explanation
    ) VALUES (
      NEW.professional_id,
      'in_app',
      format('Nueva oportunidad: %s', v_job.title),
      COALESCE(
        v_explanation_text,
        format('Compatibilidad del %s%% con esta oferta', NEW.match_score)
      ),
      format('/ofertas/%s', NEW.job_posting_id),
      NEW.job_posting_id,
      NEW.match_score,
      v_explanation_text
    );

    UPDATE job_matches
    SET is_notified = TRUE
    WHERE job_posting_id = NEW.job_posting_id
      AND professional_id = NEW.professional_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.queue_notification_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_prefs notification_preferences%ROWTYPE;
BEGIN
  SELECT email INTO v_email FROM profiles WHERE id = NEW.profile_id;
  SELECT * INTO v_prefs FROM notification_preferences WHERE profile_id = NEW.profile_id;

  IF v_email IS NOT NULL AND COALESCE(v_prefs.email_enabled, TRUE) THEN
    INSERT INTO email_queue (profile_id, to_email, subject, body_html, body_text)
    VALUES (
      NEW.profile_id,
      v_email,
      NEW.title,
      format(
        '<h2>%s</h2><p>%s</p><p><a href="%s">Ver en Portal Audiovisual</a></p>',
        NEW.title,
        NEW.body,
        COALESCE(NEW.link_url, 'https://portalaudiovisual.pages.dev')
      ),
      format('%s\n\n%s\n\nVer: %s', NEW.title, NEW.body, COALESCE(NEW.link_url, ''))
    );
  END IF;

  RETURN NEW;
END;
$$;
