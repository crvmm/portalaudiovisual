-- Service request funnel (client → professional service)
CREATE TYPE service_request_status AS ENUM (
  'new',
  'in_conversation',
  'reserved',
  'discarded'
);

CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  status service_request_status NOT NULL DEFAULT 'new',
  date_start DATE NOT NULL,
  date_end DATE,
  location TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(service_id, requester_id),
  CHECK (date_end IS NULL OR date_end >= date_start)
);

CREATE INDEX idx_service_requests_service ON service_requests(service_id);
CREATE INDEX idx_service_requests_requester ON service_requests(requester_id);
CREATE INDEX idx_service_requests_conversation ON service_requests(conversation_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

CREATE TRIGGER service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters see own service requests"
  ON service_requests FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Service owners see service requests"
  ON service_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_id AND s.professional_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create service requests"
  ON service_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters can update own service requests"
  ON service_requests FOR UPDATE
  USING (auth.uid() = requester_id);

CREATE POLICY "Service owners can update service request status"
  ON service_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_id AND s.professional_id = auth.uid()
    )
  );
