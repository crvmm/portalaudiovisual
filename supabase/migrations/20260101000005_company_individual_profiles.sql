-- Company profile extension
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  sector TEXT,
  website_url TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT DEFAULT 'ES',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_point GEOGRAPHY(POINT, 4326),
  team_size TEXT CHECK (team_size IN ('1-5', '6-20', '21-50', '51-200', '200+')),
  contact_email TEXT,
  contact_phone TEXT,
  is_audiovisual_sector BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_location ON company_profiles USING gist(location_point);
CREATE INDEX idx_company_name ON company_profiles USING gin(company_name gin_trgm_ops);

CREATE TRIGGER company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Company social links
CREATE TABLE company_social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL
);

-- Company projects / showcase
CREATE TABLE company_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  year INT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Company gallery
CREATE TABLE company_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual (particular) profile extension
CREATE TABLE individual_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT DEFAULT 'ES',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_point GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER individual_profiles_updated_at
  BEFORE UPDATE ON individual_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
