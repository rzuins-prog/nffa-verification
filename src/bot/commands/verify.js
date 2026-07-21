const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("verify").setDescription("Connect your Roblox account"),
  async execute(interaction, context) {
    const existing = context.verification.getVerification(interaction.user.id);
    if (existing) return interaction.reply({ content: `You are already verified as **${existing.roblox_username}**.`, ephemeral: true });
    const token = context.verification.createSession(interaction.user.id);
    const url = new URL(context.config.publicVerifyUrl);
    url.searchParams.set("token", token);
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("🔒 Roblox Verification")
      .setDescription("Connect your Roblox account to gain access to the server.");
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Verify with Roblox").setEmoji("✅").setStyle(ButtonStyle.Link).setURL(url.toString()));
    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
