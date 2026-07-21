const SCHEMA = `
CREATE TABLE IF NOT EXISTS verifications (
  discord_id TEXT PRIMARY KEY,
  roblox_id TEXT UNIQUE NOT NULL,
  roblox_username TEXT NOT NULL,
  roblox_display_name TEXT,
  roblox_avatar_url TEXT,
  original_discord_nickname TEXT,
  verified_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS verification_sessions (
  token TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  oauth_state TEXT,
  created_at TEXT NOT NULL,
  consumed INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_oauth_state ON verification_sessions(oauth_state) WHERE oauth_state IS NOT NULL;
`;

module.exports = { SCHEMA };
