-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  digest_frequency TEXT CHECK (digest_frequency IN ('none', 'daily', 'weekly')) DEFAULT 'weekly',
  min_budget DECIMAL(12,2),
  remote_only BOOLEAN NOT NULL DEFAULT FALSE,
  exclude_internships BOOLEAN NOT NULL DEFAULT FALSE,
  max_distance_km INT,
  preferred_cities TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Category filters for notifications
CREATE TABLE notification_category_filters (
  preference_id UUID NOT NULL REFERENCES notification_preferences(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (preference_id, category_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link_url TEXT,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  match_score DECIMAL(5,2),
  match_explanation TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_profile ON notifications(profile_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(profile_id) WHERE is_read = FALSE;

-- Stored match results (computed when job is published or profile updated)
CREATE TABLE job_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  match_score DECIMAL(5,2) NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  match_explanation JSONB NOT NULL DEFAULT '[]',
  category_score DECIMAL(5,2),
  location_score DECIMAL(5,2),
  availability_score DECIMAL(5,2),
  experience_score DECIMAL(5,2),
  budget_score DECIMAL(5,2),
  modality_score DECIMAL(5,2),
  tools_score DECIMAL(5,2),
  is_notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_posting_id, professional_id)
);

CREATE INDEX idx_job_matches_job ON job_matches(job_posting_id, match_score DESC);
CREATE INDEX idx_job_matches_professional ON job_matches(professional_id, match_score DESC);
CREATE INDEX idx_job_matches_score ON job_matches(match_score DESC) WHERE match_score >= 50;

CREATE TRIGGER job_matches_updated_at
  BEFORE UPDATE ON job_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
