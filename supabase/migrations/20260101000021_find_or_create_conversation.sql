-- Create/find conversations bypassing RLS chicken-and-egg on INSERT ... RETURNING.

CREATE OR REPLACE FUNCTION public.find_or_create_conversation(
  p_other_user_id uuid,
  p_job_posting_id uuid DEFAULT NULL,
  p_service_id uuid DEFAULT NULL,
  p_title text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_type conversation_type;
  v_existing record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_other_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  FOR v_existing IN
    SELECT cp.conversation_id
    FROM public.conversation_participants cp
    WHERE cp.profile_id = auth.uid()
  LOOP
    IF EXISTS (
      SELECT 1
      FROM public.conversation_participants other_cp
      WHERE other_cp.conversation_id = v_existing.conversation_id
        AND other_cp.profile_id = p_other_user_id
    ) THEN
      IF p_job_posting_id IS NOT NULL OR p_service_id IS NOT NULL THEN
        SELECT c.id
        INTO v_conversation_id
        FROM public.conversations c
        WHERE c.id = v_existing.conversation_id
          AND (
            (p_job_posting_id IS NOT NULL AND c.job_posting_id = p_job_posting_id)
            OR (p_service_id IS NOT NULL AND c.service_id = p_service_id)
          )
        LIMIT 1;

        IF v_conversation_id IS NOT NULL THEN
          RETURN v_conversation_id;
        END IF;
      ELSE
        RETURN v_existing.conversation_id;
      END IF;
    END IF;
  END LOOP;

  v_type := CASE
    WHEN p_job_posting_id IS NOT NULL THEN 'job_related'::conversation_type
    WHEN p_service_id IS NOT NULL THEN 'service_related'::conversation_type
    ELSE 'direct'::conversation_type
  END;

  INSERT INTO public.conversations (
    conversation_type,
    job_posting_id,
    service_id,
    title
  )
  VALUES (v_type, p_job_posting_id, p_service_id, p_title)
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES
    (v_conversation_id, auth.uid()),
    (v_conversation_id, p_other_user_id);

  RETURN v_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.find_or_create_conversation(uuid, uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_or_create_conversation(uuid, uuid, uuid, text) TO authenticated;
