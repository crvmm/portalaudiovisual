-- Allow participants to update their own last_read_at for unread badges.

CREATE POLICY "Participants can update own read state"
  ON conversation_participants FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
