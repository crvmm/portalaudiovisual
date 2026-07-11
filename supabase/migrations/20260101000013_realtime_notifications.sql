-- Enable realtime for chat and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Function to create notification when a job match is found
CREATE OR REPLACE FUNCTION notify_job_matches()
RETURNS TRIGGER AS $$
DECLARE
  v_job job_postings%ROWTYPE;
  v_prof_name TEXT;
  v_explanation_text TEXT;
BEGIN
  SELECT * INTO v_job FROM job_postings WHERE id = NEW.job_posting_id;
  SELECT display_name INTO v_prof_name FROM profiles WHERE id = NEW.professional_id;

  -- Build explanation text from JSONB
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

    NEW.is_notified := TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_matches_notify
  AFTER INSERT OR UPDATE OF match_score ON job_matches
  FOR EACH ROW EXECUTE FUNCTION notify_job_matches();

-- Queue email notifications (stores pending emails for edge function processing)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_email_queue_pending ON email_queue(status) WHERE status = 'pending';

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Function to queue email when in-app notification is created
CREATE OR REPLACE FUNCTION queue_notification_email()
RETURNS TRIGGER AS $$
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
        '<h2>%s</h2><p>%s</p><p><a href="%s">Ver en Audiovisual Jobs</a></p>',
        NEW.title,
        NEW.body,
        COALESCE(NEW.link_url, 'https://audiovisualjobs.com')
      ),
      format('%s\n\n%s\n\nVer: %s', NEW.title, NEW.body, COALESCE(NEW.link_url, ''))
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_queue_email
  AFTER INSERT ON notifications
  FOR EACH ROW
  WHEN (NEW.channel = 'in_app')
  EXECUTE FUNCTION queue_notification_email();
