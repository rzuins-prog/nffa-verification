require("dotenv").config({ quiet: true });
const { loadConfig } = require("./config");
const { createDatabase } = require("./database/database");
const { createVerificationService } = require("./services/verification");
const { createRobloxOAuth } = require("./services/robloxOAuth");
const { getRobloxAvatar } = require("./services/robloxAvatar");
const { createDiscordBot } = require("./bot/client");
const { createApp } = require("./web/server");

async function main() {
  try {
    const config = loadConfig();
    const db = createDatabase(config.databasePath);
    console.log("[DATABASE] SQLite database connected");
    const verification = createVerificationService(db);
    const context = { config, db, verification };
    const bot = createDiscordBot(context);
    const oauth = createRobloxOAuth(config);
    const app = createApp({ config, verification, oauth, getAvatar: getRobloxAvatar, completeDiscordVerification: bot.completeDiscordVerification });
    app.listen(config.port, "0.0.0.0", () => console.log(`[WEB] Verification server listening on port ${config.port}`));
    await bot.login();
  } catch (error) {
    console.error("[STARTUP] Unable to start:", error.message);
    process.exitCode = 1;
  }
}
main();
