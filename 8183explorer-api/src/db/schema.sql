-- 8183Explorer database schema

CREATE TABLE IF NOT EXISTS agents (
  id               SERIAL PRIMARY KEY,
  agent_id         BIGINT NOT NULL,
  network          TEXT    NOT NULL DEFAULT 'base_sepolia',
  source           TEXT    NOT NULL DEFAULT 'local',
  uri              TEXT,
  owner_address    TEXT NOT NULL,
  wallet_address   TEXT NOT NULL,
  name             TEXT,
  description      TEXT,
  image_uri        TEXT,
  categories       TEXT[]  DEFAULT '{}',
  services         JSONB   DEFAULT '[]',
  external_stats   JSONB   DEFAULT NULL,
  active           BOOLEAN DEFAULT true,
  registered_block BIGINT,
  registered_at    BIGINT,
  updated_at       BIGINT,
  UNIQUE (agent_id, network)
);

-- Migrate existing schema if needed
ALTER TABLE agents ADD COLUMN IF NOT EXISTS network TEXT NOT NULL DEFAULT 'base_sepolia';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'local';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS external_stats JSONB DEFAULT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'agents' AND constraint_name = 'agents_agent_id_key'
  ) THEN
    ALTER TABLE agents DROP CONSTRAINT agents_agent_id_key;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'agents' AND constraint_name = 'agents_agent_id_network_key'
  ) THEN
    ALTER TABLE agents ADD CONSTRAINT agents_agent_id_network_key UNIQUE (agent_id, network);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS jobs (
  id                SERIAL PRIMARY KEY,
  job_id            BIGINT UNIQUE NOT NULL,
  client_address    TEXT NOT NULL,
  provider_address  TEXT NOT NULL,
  evaluator_address TEXT,
  description       TEXT,
  budget_wei        TEXT    DEFAULT '0',
  expired_at        BIGINT,
  status            INTEGER DEFAULT 0,
  created_block     BIGINT,
  created_at        BIGINT,
  completed_at      BIGINT
);

CREATE TABLE IF NOT EXISTS feedback (
  id              SERIAL PRIMARY KEY,
  agent_id        BIGINT NOT NULL,
  client_address  TEXT   NOT NULL,
  feedback_index  BIGINT NOT NULL,
  value           BIGINT NOT NULL,
  value_decimals  INTEGER DEFAULT 2,
  tag1            TEXT    DEFAULT '',
  tag2            TEXT    DEFAULT '',
  endpoint        TEXT    DEFAULT '',
  feedback_uri    TEXT    DEFAULT '',
  is_revoked      BOOLEAN DEFAULT false,
  given_block     BIGINT,
  given_at        BIGINT,
  UNIQUE (agent_id, client_address, feedback_index)
);

CREATE TABLE IF NOT EXISTS indexer_state (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jobs_provider   ON jobs (provider_address);
CREATE INDEX IF NOT EXISTS idx_jobs_client     ON jobs (client_address);
CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_feedback_agent  ON feedback (agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_name     ON agents (name);
CREATE INDEX IF NOT EXISTS idx_agents_wallet   ON agents (wallet_address);

-- Initial indexer state
INSERT INTO indexer_state (key, value)
VALUES ('last_indexed_block', '0')
ON CONFLICT (key) DO NOTHING;

INSERT INTO indexer_state (key, value)
VALUES ('last_indexed_block_erc8004_mainnet', '0')
ON CONFLICT (key) DO NOTHING;
