const crypto = require("node:crypto");

const SESSION_TTL_MS = 15 * 60 * 1000;
const randomSecret = () => crypto.randomBytes(32).toString("base64url");

function createVerificationService(db) {
  const createSession = db.transaction((discordId) => {
    const token = randomSecret();
    db.prepare("DELETE FROM verification_sessions WHERE discord_id = ?").run(discordId);
    db.prepare("INSERT INTO verification_sessions (token, discord_id, created_at) VALUES (?, ?, ?)")
      .run(token, discordId, new Date().toISOString());
    return token;
  });

  function getUsableSession(token) {
    if (!token || typeof token !== "string") return null;
    const row = db.prepare("SELECT * FROM verification_sessions WHERE token = ? AND consumed = 0").get(token);
    if (!row || Date.now() - Date.parse(row.created_at) > SESSION_TTL_MS) return null;
    return row;
  }

  function setOAuthState(token) {
    const state = randomSecret();
    db.prepare("UPDATE verification_sessions SET oauth_state = ? WHERE token = ? AND consumed = 0").run(state, token);
    return state;
  }

  function findByState(state) {
    if (!state || typeof state !== "string") return null;
    const row = db.prepare("SELECT * FROM verification_sessions WHERE oauth_state = ? AND consumed = 0").get(state);
    if (!row || Date.now() - Date.parse(row.created_at) > SESSION_TTL_MS) return null;
    return row;
  }

  const complete = db.transaction((session, profile, avatarUrl, originalNickname) => {
    const linked = db.prepare("SELECT discord_id FROM verifications WHERE roblox_id = ?").get(String(profile.sub));
    if (linked && linked.discord_id !== session.discord_id) {
      const error = new Error("This Roblox account is already linked.");
      error.code = "ROBLOX_ALREADY_LINKED";
      throw error;
    }
    db.prepare(`INSERT INTO verifications
      (discord_id, roblox_id, roblox_username, roblox_display_name, roblox_avatar_url, original_discord_nickname, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(session.discord_id, String(profile.sub), profile.preferred_username || profile.name,
        profile.nickname || profile.preferred_username || profile.name, avatarUrl || null,
        originalNickname || null, new Date().toISOString());
    db.prepare("UPDATE verification_sessions SET consumed = 1 WHERE token = ? AND consumed = 0").run(session.token);
    return db.prepare("SELECT * FROM verifications WHERE discord_id = ?").get(session.discord_id);
  });

  return {
    createSession, getUsableSession, setOAuthState, findByState, complete,
    getVerification: (id) => db.prepare("SELECT * FROM verifications WHERE discord_id = ?").get(id),
    removeVerification: db.transaction((id) => {
      const record = db.prepare("SELECT * FROM verifications WHERE discord_id = ?").get(id);
      db.prepare("DELETE FROM verifications WHERE discord_id = ?").run(id);
      db.prepare("DELETE FROM verification_sessions WHERE discord_id = ?").run(id);
      return record;
    })
  };
}

module.exports = { createVerificationService, SESSION_TTL_MS };
