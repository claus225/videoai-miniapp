-- KREA STUDIO backend schema (Cloudflare D1 / SQLite).
-- OAuth tokens must only be stored encrypted by the server.
-- Never add plaintext access or refresh tokens to this schema.

CREATE TABLE IF NOT EXISTS social_connections (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'youtube', 'tiktok')),
  platform_user_id TEXT,
  display_name TEXT,
  access_token_ciphertext BLOB,
  refresh_token_ciphertext BLOB,
  token_expires_at TEXT,
  scopes_json TEXT NOT NULL DEFAULT '[]',
  connection_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (connection_status IN ('pending', 'connected', 'expired', 'revoked', 'error')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (owner_id, platform, platform_user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_connections_owner
  ON social_connections(owner_id);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  caption TEXT NOT NULL,
  media_reference TEXT,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due
  ON scheduled_posts(status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_owner
  ON scheduled_posts(owner_id);

CREATE TABLE IF NOT EXISTS post_targets (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'youtube', 'tiktok')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'publishing', 'published', 'failed', 'skipped')),
  platform_post_id TEXT,
  error_code TEXT,
  error_message TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_post_targets_post
  ON post_targets(post_id);
