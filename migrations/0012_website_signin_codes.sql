CREATE TABLE IF NOT EXISTS dts_signin_codes (
 code_hash text PRIMARY KEY,
 challenge text NOT NULL,
 email text NOT NULL,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS dts_signin_codes_expiry ON dts_signin_codes(expires_at);
