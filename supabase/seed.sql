-- ============================================================================
-- seed.sql — local development seed data
-- ============================================================================

-- Insert a demo tenant
INSERT INTO tenants (id, name, industry, phone, calendar_provider, timezone)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Acme General Contracting',
  'general_contractor',
  '+15550001234',
  'google',
  'America/New_York'
);
