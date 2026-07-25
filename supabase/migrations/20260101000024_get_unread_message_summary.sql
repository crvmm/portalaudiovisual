-- Server-side unread counts (single source of truth).

CREATE OR REPLACE FUNCTION public.get_unread_message_summary()
RETURNS TABLE(conversation_id uuid, unread_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cp.conversation_id,
    1
  FROM public.conversation_participants cp
  WHERE cp.profile_id = auth.uid()
    AND (
      SELECT m.sender_id
      FROM public.messages m
      WHERE m.conversation_id = cp.conversation_id
      ORDER BY m.created_at DESC
      LIMIT 1
    ) IS DISTINCT FROM auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.messages m
      WHERE m.conversation_id = cp.conversation_id
        AND m.sender_id <> auth.uid()
        AND m.created_at > COALESCE(cp.last_read_at, '-infinity'::timestamptz)
    );
$$;

REVOKE ALL ON FUNCTION public.get_unread_message_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unread_message_summary() TO authenticated;
