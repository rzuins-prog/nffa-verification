const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");
const verifyCommand = require("./commands/verify");
const commands = [verifyCommand, require("./commands/profile"), require("./commands/whois"), require("./commands/unverify"), require("./commands/verify-panel")];

function createDiscordBot(context) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
  client.commands = new Collection(commands.map((command) => [command.data.name, command]));

  client.once("ready", () => {
    console.log("[DISCORD] Bot logged in");
    console.log("[DISCORD] Slash commands ready");
  });
  client.on("interactionCreate", async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) await command.execute(interaction, context);
      } else if (interaction.isButton() && interaction.customId === "start-verification") {
        await verifyCommand.execute(interaction, context);
      } else if (interaction.isButton() && interaction.customId.startsWith("unverify-")) {
        const [action, userId] = interaction.customId.split(":");
        if (interaction.user.id !== userId) return interaction.reply({ content: "This confirmation is not for you.", ephemeral: true });
        if (action === "unverify-cancel") return interaction.update({ content: "Unverify cancelled.", components: [] });
        const record = context.verification.removeVerification(userId);
        if (interaction.member) {
          await interaction.member.roles.remove(context.config.verifiedRoleId).catch(() => {});
          await interaction.member.roles.add(context.config.unverifiedRoleId).catch(() => {});
          if (record?.original_discord_nickname !== undefined) await interaction.member.setNickname(record.original_discord_nickname).catch(() => {});
        }
        return interaction.update({ content: "Your Roblox account has been disconnected.", components: [] });
      }
    } catch (error) {
      console.error("[DISCORD] Interaction failed:", error.message);
      const payload = { content: "That action could not be completed. Please try again later.", ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {}); else await interaction.reply(payload).catch(() => {});
    }
  });

  async function completeDiscordVerification(record) {
    const guild = await client.guilds.fetch(context.config.discordGuildId);
    const member = await guild.members.fetch(record.discord_id);
    const originalNickname = member.nickname;
    context.db.prepare("UPDATE verifications SET original_discord_nickname = ? WHERE discord_id = ?").run(originalNickname, record.discord_id);
    await member.roles.add(context.config.verifiedRoleId).catch((e) => console.error("[DISCORD] Could not add Verified role:", e.message));
    await member.roles.remove(context.config.unverifiedRoleId).catch((e) => console.error("[DISCORD] Could not remove Unverified role:", e.message));
    if (context.config.syncNicknames) await member.setNickname(record.roblox_username).catch((e) => console.error("[DISCORD] Could not sync nickname:", e.message));
    const embed = new EmbedBuilder().setColor(0x22c55e).setTitle("✅ Member Verified").setThumbnail(record.roblox_avatar_url || null)
      .addFields(
        { name: "Discord", value: `<@${record.discord_id}>`, inline: true }, { name: "Discord ID", value: record.discord_id, inline: true },
        { name: "Roblox Username", value: record.roblox_username, inline: true }, { name: "Roblox Display Name", value: record.roblox_display_name || record.roblox_username, inline: true },
        { name: "Roblox ID", value: record.roblox_id, inline: true }, { name: "Verified At", value: `<t:${Math.floor(Date.parse(record.verified_at) / 1000)}:F>` }
      );
    await member.send({ content: "Your Roblox account has been verified.", embeds: [embed] }).catch(() => {});
    const channel = await client.channels.fetch(context.config.logChannelId).catch(() => null);
    if (channel?.isTextBased()) await channel.send({ embeds: [embed] });
  }

  return { client, login: () => client.login(context.config.discordToken), completeDiscordVerification };
}

module.exports = { createDiscordBot, commands };
