-- Fix search_professionals: invalid alias "p" broke the professionals directory.

CREATE OR REPLACE FUNCTION public.search_professionals(
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
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.id,
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
$$;

GRANT EXECUTE ON FUNCTION public.search_professionals(
  TEXT, UUID, TEXT, work_modality, DATE, DECIMAL, TEXT, INT, INT
) TO anon, authenticated;
