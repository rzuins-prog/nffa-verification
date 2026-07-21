require("dotenv").config({ quiet: true });
const { REST, Routes } = require("discord.js");
const { loadConfig } = require("../config");
const { commands } = require("./client");

async function main() {
  try {
    const config = loadConfig();
    const rest = new REST({ version: "10" }).setToken(config.discordToken);
    await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), { body: commands.map((command) => command.data.toJSON()) });
    console.log("[DISCORD] Slash commands registered");
  } catch (error) {
    console.error("[DISCORD] Command registration failed:", error.message);
    process.exitCode = 1;
  }
}
main();
