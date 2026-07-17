-- Fix infinite recursion in conversation_participants RLS policies.
-- The SELECT policy queried the same table inside EXISTS, causing 500 errors on /mensajes.

CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = conv_id
      AND profile_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_conversation_participant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid) TO authenticated;

DROP POLICY IF EXISTS "Participants can view conversations" ON conversations;
DROP POLICY IF EXISTS "Participants can view participation" ON conversation_participants;
DROP POLICY IF EXISTS "Participants can read messages" ON messages;
DROP POLICY IF EXISTS "Participants can send messages" ON messages;

CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT
  USING (public.is_conversation_participant(id));

CREATE POLICY "Participants can view participation"
  ON conversation_participants FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_conversation_participant(conversation_id)
  );
