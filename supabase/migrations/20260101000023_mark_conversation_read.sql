-- Reliable read receipts + realtime updates for unread badges.

CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_read_at timestamptz;
BEGIN
  IF NOT public.is_conversation_participant(p_conversation_id) THEN
    RAISE EXCEPTION 'Not a participant';
  END IF;

  SELECT COALESCE(MAX(created_at), now())
  INTO v_read_at
  FROM public.messages
  WHERE conversation_id = p_conversation_id;

  UPDATE public.conversation_participants
  SET last_read_at = v_read_at
  WHERE conversation_id = p_conversation_id
    AND profile_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
