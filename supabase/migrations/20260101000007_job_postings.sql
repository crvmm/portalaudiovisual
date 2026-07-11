-- Job postings / opportunities / encargos
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_type profile_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  posting_type job_posting_type NOT NULL,
  contract_type contract_type,
  work_modality work_modality NOT NULL DEFAULT 'on_site',
  location_city TEXT,
  location_region TEXT,
  location_country TEXT DEFAULT 'ES',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_point GEOGRAPHY(POINT, 4326),
  project_start_date DATE,
  project_end_date DATE,
  schedule TEXT,
  duration TEXT,
  experience_required TEXT CHECK (experience_required IN ('none', 'junior', 'mid', 'senior', 'expert')),
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  salary_min DECIMAL(12,2),
  salary_max DECIMAL(12,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  positions_count INT NOT NULL DEFAULT 1,
  requires_own_equipment BOOLEAN NOT NULL DEFAULT FALSE,
  requires_vehicle BOOLEAN NOT NULL DEFAULT FALSE,
  application_deadline DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled', 'cancelled')),
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_postings_author ON job_postings(author_id);
CREATE INDEX idx_job_postings_status ON job_postings(status) WHERE status = 'open';
CREATE INDEX idx_job_postings_type ON job_postings(posting_type);
CREATE INDEX idx_job_postings_location ON job_postings USING gist(location_point);
CREATE INDEX idx_job_postings_dates ON job_postings(project_start_date, project_end_date);
CREATE INDEX idx_job_postings_title ON job_postings USING gin(title gin_trgm_ops);

CREATE TRIGGER job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Categories required for a job posting
CREATE TABLE job_posting_categories (
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (job_posting_id, category_id)
);

-- Specialties required
CREATE TABLE job_posting_specialties (
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (job_posting_id, specialty_id)
);

-- Languages required
CREATE TABLE job_posting_languages (
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  PRIMARY KEY (job_posting_id, language_id)
);

-- Tools required
CREATE TABLE job_posting_tools (
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  PRIMARY KEY (job_posting_id, tool_id)
);

-- Equipment required
CREATE TABLE job_posting_equipment (
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  PRIMARY KEY (job_posting_id, equipment_id)
);
