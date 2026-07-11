-- Matching function: computes compatibility between a job posting and a professional
CREATE OR REPLACE FUNCTION compute_job_match(
  p_job_id UUID,
  p_professional_id UUID
)
RETURNS TABLE (
  match_score DECIMAL(5,2),
  match_explanation JSONB,
  category_score DECIMAL(5,2),
  location_score DECIMAL(5,2),
  availability_score DECIMAL(5,2),
  experience_score DECIMAL(5,2),
  budget_score DECIMAL(5,2),
  modality_score DECIMAL(5,2),
  tools_score DECIMAL(5,2)
) AS $$
DECLARE
  v_job job_postings%ROWTYPE;
  v_prof professional_profiles%ROWTYPE;
  v_cat_score DECIMAL(5,2) := 0;
  v_loc_score DECIMAL(5,2) := 0;
  v_avail_score DECIMAL(5,2) := 0;
  v_exp_score DECIMAL(5,2) := 0;
  v_budget_score DECIMAL(5,2) := 0;
  v_mod_score DECIMAL(5,2) := 0;
  v_tools_score DECIMAL(5,2) := 0;
  v_total DECIMAL(5,2) := 0;
  v_explanation JSONB := '[]'::JSONB;
  v_matching_cats INT;
  v_required_cats INT;
  v_distance_km DOUBLE PRECISION;
BEGIN
  SELECT * INTO v_job FROM job_postings WHERE id = p_job_id;
  SELECT * INTO v_prof FROM professional_profiles WHERE id = p_professional_id;

  IF v_job IS NULL OR v_prof IS NULL THEN
    RETURN;
  END IF;

  -- Category match (weight: 30%)
  SELECT COUNT(*) INTO v_required_cats
  FROM job_posting_categories WHERE job_posting_id = p_job_id;

  IF v_required_cats > 0 THEN
    SELECT COUNT(*) INTO v_matching_cats
    FROM job_posting_categories jpc
    JOIN professional_categories pc ON pc.category_id = jpc.category_id
    WHERE jpc.job_posting_id = p_job_id AND pc.professional_id = p_professional_id;

    v_cat_score := (v_matching_cats::DECIMAL / v_required_cats) * 100;
    IF v_cat_score > 0 THEN
      v_explanation := v_explanation || jsonb_build_object(
        'type', 'categories',
        'message', format('Coincide con %s de %s categorías requeridas', v_matching_cats, v_required_cats),
        'positive', v_cat_score >= 50
      );
    END IF;
  ELSE
    v_cat_score := 50;
  END IF;

  -- Location match (weight: 20%)
  IF v_job.work_modality = 'remote' OR v_prof.work_modality @> ARRAY['remote']::work_modality[] THEN
    v_loc_score := 100;
    v_explanation := v_explanation || jsonb_build_object(
      'type', 'location',
      'message', 'Trabajo remoto compatible',
      'positive', true
    );
  ELSIF v_job.location_city IS NOT NULL AND v_prof.location_city IS NOT NULL THEN
    IF LOWER(v_job.location_city) = LOWER(v_prof.location_city) THEN
      v_loc_score := 100;
      v_explanation := v_explanation || jsonb_build_object(
        'type', 'location',
        'message', format('Ubicación coincidente: %s', v_job.location_city),
        'positive', true
      );
    ELSIF v_job.location_point IS NOT NULL AND v_prof.location_point IS NOT NULL THEN
      v_distance_km := ST_Distance(v_job.location_point, v_prof.location_point) / 1000;
      IF v_distance_km <= 50 THEN
        v_loc_score := GREATEST(0, 100 - (v_distance_km * 2));
        v_explanation := v_explanation || jsonb_build_object(
          'type', 'location',
          'message', format('A %.0f km de la ubicación del proyecto', v_distance_km),
          'positive', v_distance_km <= 30
        );
      END IF;
    END IF;
  ELSE
    v_loc_score := 50;
  END IF;

  -- Availability match (weight: 20%)
  IF v_job.project_start_date IS NOT NULL AND v_job.project_end_date IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM availability_slots
      WHERE professional_id = p_professional_id
        AND date BETWEEN v_job.project_start_date AND v_job.project_end_date
        AND status IN ('busy', 'vacation')
    ) THEN
      IF EXISTS (
        SELECT 1 FROM availability_slots
        WHERE professional_id = p_professional_id
          AND date BETWEEN v_job.project_start_date AND v_job.project_end_date
          AND status = 'available'
      ) THEN
        v_avail_score := 100;
        v_explanation := v_explanation || jsonb_build_object(
          'type', 'availability',
          'message', 'Disponible en las fechas del proyecto',
          'positive', true
        );
      ELSIF v_prof.is_available THEN
        v_avail_score := 70;
        v_explanation := v_explanation || jsonb_build_object(
          'type', 'availability',
          'message', 'Marcado como disponible generalmente',
          'positive', true
        );
      END IF;
    ELSE
      v_avail_score := 0;
      v_explanation := v_explanation || jsonb_build_object(
        'type', 'availability',
        'message', 'No disponible en las fechas del proyecto',
        'positive', false
      );
    END IF;
  ELSIF v_prof.is_available THEN
    v_avail_score := 80;
  END IF;

  -- Experience match (weight: 10%)
  IF v_job.experience_required IS NULL OR v_job.experience_required = 'none' THEN
    v_exp_score := 100;
  ELSIF v_prof.experience_level IS NOT NULL THEN
    v_exp_score := CASE
      WHEN v_job.experience_required = 'junior' THEN 100
      WHEN v_job.experience_required = 'mid' AND v_prof.experience_level IN ('mid', 'senior', 'expert') THEN 100
      WHEN v_job.experience_required = 'senior' AND v_prof.experience_level IN ('senior', 'expert') THEN 100
      WHEN v_job.experience_required = 'expert' AND v_prof.experience_level = 'expert' THEN 100
      ELSE 30
    END;
    IF v_exp_score >= 70 THEN
      v_explanation := v_explanation || jsonb_build_object(
        'type', 'experience',
        'message', 'Nivel de experiencia compatible',
        'positive', true
      );
    END IF;
  END IF;

  -- Budget match (weight: 10%)
  IF v_job.budget_max IS NOT NULL AND v_prof.daily_rate_min IS NOT NULL THEN
    IF v_prof.daily_rate_min <= v_job.budget_max THEN
      v_budget_score := 100;
      v_explanation := v_explanation || jsonb_build_object(
        'type', 'budget',
        'message', 'Tarifa dentro del presupuesto',
        'positive', true
      );
    ELSE
      v_budget_score := GREATEST(0, 100 - ((v_prof.daily_rate_min - v_job.budget_max) / v_job.budget_max * 100));
    END IF;
  ELSIF v_job.salary_max IS NOT NULL THEN
    v_budget_score := 70;
  ELSE
    v_budget_score := 50;
  END IF;

  -- Modality match (weight: 5%)
  IF v_job.work_modality = ANY(v_prof.work_modality) THEN
    v_mod_score := 100;
    v_explanation := v_explanation || jsonb_build_object(
      'type', 'modality',
      'message', format('Modalidad %s compatible', v_job.work_modality),
      'positive', true
    );
  END IF;

  -- Tools match (weight: 5%)
  IF EXISTS (SELECT 1 FROM job_posting_tools WHERE job_posting_id = p_job_id) THEN
    SELECT
      CASE WHEN COUNT(jpt.*) > 0
        THEN (COUNT(pt.*)::DECIMAL / COUNT(jpt.*)) * 100
        ELSE 50
      END INTO v_tools_score
    FROM job_posting_tools jpt
    LEFT JOIN professional_tools pt ON pt.tool_id = jpt.tool_id AND pt.professional_id = p_professional_id
    WHERE jpt.job_posting_id = p_job_id;
  ELSE
    v_tools_score := 50;
  END IF;

  -- Weighted total
  v_total := (
    v_cat_score * 0.30 +
    v_loc_score * 0.20 +
    v_avail_score * 0.20 +
    v_exp_score * 0.10 +
    v_budget_score * 0.10 +
    v_mod_score * 0.05 +
    v_tools_score * 0.05
  );

  RETURN QUERY SELECT
    ROUND(v_total, 2),
    v_explanation,
    ROUND(v_cat_score, 2),
    ROUND(v_loc_score, 2),
    ROUND(v_avail_score, 2),
    ROUND(v_exp_score, 2),
    ROUND(v_budget_score, 2),
    ROUND(v_mod_score, 2),
    ROUND(v_tools_score, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Recompute all matches for a job posting
CREATE OR REPLACE FUNCTION recompute_job_matches(p_job_id UUID)
RETURNS VOID AS $$
DECLARE
  v_prof RECORD;
  v_match RECORD;
BEGIN
  DELETE FROM job_matches WHERE job_posting_id = p_job_id;

  FOR v_prof IN
    SELECT pp.id FROM professional_profiles pp
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
$$ LANGUAGE plpgsql;

-- Trigger: recompute matches when job is published/updated
CREATE OR REPLACE FUNCTION trigger_recompute_job_matches()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'open' THEN
    PERFORM recompute_job_matches(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_postings_recompute_matches
  AFTER INSERT OR UPDATE OF status, location_city, project_start_date, project_end_date
  ON job_postings
  FOR EACH ROW EXECUTE FUNCTION trigger_recompute_job_matches();

-- Update location_point from lat/lng
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_lat IS NOT NULL AND NEW.location_lng IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER professional_location_point
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON professional_profiles
  FOR EACH ROW EXECUTE FUNCTION update_location_point();

CREATE TRIGGER company_location_point
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON company_profiles
  FOR EACH ROW EXECUTE FUNCTION update_location_point();

CREATE TRIGGER individual_location_point
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON individual_profiles
  FOR EACH ROW EXECUTE FUNCTION update_location_point();

CREATE TRIGGER job_posting_location_point
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_location_point();

-- Average rating view
CREATE OR REPLACE VIEW profile_ratings AS
SELECT
  reviewee_id AS profile_id,
  ROUND(AVG(overall_rating)::NUMERIC, 2) AS avg_rating,
  COUNT(*) AS review_count
FROM reviews
GROUP BY reviewee_id;

-- Search professionals function
CREATE OR REPLACE FUNCTION search_professionals(
  p_query TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_modality work_modality DEFAULT NULL,
  p_available_date DATE DEFAULT NULL,
  p_max_hourly_rate DECIMAL DEFAULT NULL,
  p_experience_level TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  headline TEXT,
  location_city TEXT,
  years_experience INT,
  experience_level TEXT,
  hourly_rate_min DECIMAL,
  avg_rating NUMERIC,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    pr.display_name,
    pp.headline,
    pp.location_city,
    pp.years_experience,
    pp.experience_level,
    pp.hourly_rate_min,
    COALESCE(rat.avg_rating, 0),
    COALESCE(rat.review_count, 0)
  FROM professional_profiles pp
  JOIN profiles pr ON pr.id = pp.id
  LEFT JOIN profile_ratings rat ON rat.profile_id = pp.id
  WHERE pr.is_active = TRUE
    AND (p_query IS NULL OR pr.display_name ILIKE '%' || p_query || '%' OR pp.headline ILIKE '%' || p_query || '%')
    AND (p_category_id IS NULL OR EXISTS (
      SELECT 1 FROM professional_categories pc WHERE pc.professional_id = pp.id AND pc.category_id = p_category_id
    ))
    AND (p_city IS NULL OR LOWER(pp.location_city) = LOWER(p_city))
    AND (p_modality IS NULL OR p_modality = ANY(pp.work_modality))
    AND (p_max_hourly_rate IS NULL OR pp.hourly_rate_min IS NULL OR pp.hourly_rate_min <= p_max_hourly_rate)
    AND (p_experience_level IS NULL OR pp.experience_level = p_experience_level)
    AND (p_available_date IS NULL OR NOT EXISTS (
      SELECT 1 FROM availability_slots av
      WHERE av.professional_id = pp.id AND av.date = p_available_date AND av.status IN ('busy', 'vacation')
    ))
  ORDER BY COALESCE(rat.avg_rating, 0) DESC, pr.display_name
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
