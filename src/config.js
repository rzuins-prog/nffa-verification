const path = require("node:path");

const REQUIRED = [
  "DISCORD_TOKEN", "DISCORD_CLIENT_ID", "DISCORD_GUILD_ID",
  "VERIFIED_ROLE_ID", "UNVERIFIED_ROLE_ID", "VERIFICATION_LOG_CHANNEL_ID",
  "ROBLOX_CLIENT_ID", "ROBLOX_CLIENT_SECRET", "ROBLOX_REDIRECT_URI", "PUBLIC_VERIFY_URL"
];

function loadConfig(env = process.env, { validate = true } = {}) {
  if (validate) {
    const missing = REQUIRED.filter((key) => !env[key]?.trim());
    if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  return {
    discordToken: env.DISCORD_TOKEN,
    discordClientId: env.DISCORD_CLIENT_ID,
    discordGuildId: env.DISCORD_GUILD_ID,
    verifiedRoleId: env.VERIFIED_ROLE_ID,
    unverifiedRoleId: env.UNVERIFIED_ROLE_ID,
    logChannelId: env.VERIFICATION_LOG_CHANNEL_ID,
    robloxClientId: env.ROBLOX_CLIENT_ID,
    robloxClientSecret: env.ROBLOX_CLIENT_SECRET,
    robloxRedirectUri: env.ROBLOX_REDIRECT_URI,
    publicVerifyUrl: env.PUBLIC_VERIFY_URL,
    databasePath: path.resolve(env.DATABASE_PATH || "./data/verification.db"),
    syncNicknames: String(env.SYNC_NICKNAMES || "true").toLowerCase() === "true",
    port: Number(env.PORT || 3000)
  };
}

module.exports = { loadConfig, REQUIRED };
