CREATE TABLE IF NOT EXISTS dts_control_leads (
 id text PRIMARY KEY,
 site_id text NOT NULL CHECK (site_id IN ('demore','demore-technology')),
 source text NOT NULL,
 source_record_id text NOT NULL,
 request_hash text NOT NULL,
 name text NOT NULL,
 email text NOT NULL DEFAULT '',
 phone text NOT NULL DEFAULT '',
 phone_key text NOT NULL DEFAULT '',
 interest text NOT NULL DEFAULT '',
 stage text NOT NULL DEFAULT 'new' CHECK (stage IN ('new','qualified','contacted','won','lost')),
 owner text NOT NULL DEFAULT 'unassigned' CHECK (owner IN ('unassigned','ryan')),
 version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(site_id,source,source_record_id),
 UNIQUE(site_id,id)
);
CREATE INDEX IF NOT EXISTS dts_control_leads_site_recent ON dts_control_leads(site_id,created_at DESC);
CREATE INDEX IF NOT EXISTS dts_control_leads_email ON dts_control_leads(site_id,email) WHERE email <> '';
CREATE INDEX IF NOT EXISTS dts_control_leads_phone ON dts_control_leads(site_id,phone_key) WHERE phone_key <> '';
CREATE TABLE IF NOT EXISTS dts_control_lead_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 site_id text NOT NULL,
 lead_id text NOT NULL,
 actor text NOT NULL,
 action text NOT NULL,
 details jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(site_id,lead_id) REFERENCES dts_control_leads(site_id,id)
);
