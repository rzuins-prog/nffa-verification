const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("verify-panel").setDescription("Post the Roblox verification panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("🔒 Roblox Verification")
      .setDescription("Verify your Roblox account to gain full access to the server.\n\nYour Roblox ID, username, display name, and avatar will be connected to your Discord account.");
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("start-verification").setLabel("Verify").setEmoji("✅").setStyle(ButtonStyle.Primary));
    await interaction.channel.send({ embeds: [embed], components: [row] });
    return interaction.reply({ content: "Verification panel posted.", ephemeral: true });
  }
};
