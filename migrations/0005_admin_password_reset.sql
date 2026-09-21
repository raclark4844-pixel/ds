CREATE TABLE IF NOT EXISTS dts_admin_credentials (
  id integer PRIMARY KEY CHECK (id = 1),
  password_hash text,
  session_secret text,
  reset_hash text,
  reset_expires_at timestamptz,
  reset_requested_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO dts_admin_credentials(id) VALUES (1) ON CONFLICT DO NOTHING;
