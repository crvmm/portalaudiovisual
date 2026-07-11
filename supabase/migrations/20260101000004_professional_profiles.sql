-- Professional profile extension
CREATE TABLE professional_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  cv_url TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT DEFAULT 'ES',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_point GEOGRAPHY(POINT, 4326),
  work_modality work_modality[] DEFAULT '{on_site,remote,hybrid}',
  years_experience INT,
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'expert')),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  hourly_rate_min DECIMAL(10,2),
  hourly_rate_max DECIMAL(10,2),
  daily_rate_min DECIMAL(10,2),
  daily_rate_max DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_professional_location ON professional_profiles USING gist(location_point);
CREATE INDEX idx_professional_available ON professional_profiles(is_available);
CREATE INDEX idx_professional_city ON professional_profiles(location_city);

CREATE TRIGGER professional_profiles_updated_at
  BEFORE UPDATE ON professional_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Job seeking preferences (multi-select)
CREATE TABLE professional_job_seeking (
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  seeking_type job_seeking_type NOT NULL,
  PRIMARY KEY (professional_id, seeking_type)
);

-- Professional categories
CREATE TABLE professional_categories (
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, category_id)
);

-- Professional specialties
CREATE TABLE professional_specialties (
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, specialty_id)
);

-- Professional languages
CREATE TABLE professional_languages (
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  proficiency TEXT CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'native')),
  PRIMARY KEY (professional_id, language_id)
);

-- Professional tools
CREATE TABLE professional_tools (
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  proficiency TEXT CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'expert')),
  PRIMARY KEY (professional_id, tool_id)
);

-- Professional equipment
CREATE TABLE professional_equipment (
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  owns BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  PRIMARY KEY (professional_id, equipment_id)
);

-- External links
CREATE TABLE professional_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- Work experience
CREATE TABLE work_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  project_name TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_experiences_professional ON work_experiences(professional_id);

-- Education
CREATE TABLE educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_educations_professional ON educations(professional_id);

-- Portfolio items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'embed', 'document', '3d')),
  media_url TEXT,
  thumbnail_url TEXT,
  external_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_professional ON portfolio_items(professional_id);
