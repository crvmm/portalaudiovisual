-- Provincia (INE), separada de location_region (comunidad autónoma).

ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS location_province TEXT;

ALTER TABLE company_profiles
  ADD COLUMN IF NOT EXISTS location_province TEXT;

ALTER TABLE individual_profiles
  ADD COLUMN IF NOT EXISTS location_province TEXT;

ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS location_province TEXT;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS location_province TEXT;

CREATE INDEX IF NOT EXISTS idx_professional_province ON professional_profiles(location_province);
CREATE INDEX IF NOT EXISTS idx_job_postings_province ON job_postings(location_province);
