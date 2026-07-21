const { SlashCommandBuilder } = require("discord.js");
const { profileEmbed } = require("./profile-card");

module.exports = {
  data: new SlashCommandBuilder().setName("profile").setDescription("Show your verified Roblox profile"),
  async execute(interaction, context) {
    const record = context.verification.getVerification(interaction.user.id);
    if (!record) return interaction.reply({ content: "You are not verified. Use `/verify` to connect your Roblox account.", ephemeral: true });
    return interaction.reply({ embeds: [profileEmbed(interaction.user, record)], ephemeral: true });
  }
};
