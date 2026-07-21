const { SlashCommandBuilder } = require("discord.js");
const { profileEmbed } = require("./profile-card");

module.exports = {
  data: new SlashCommandBuilder().setName("whois").setDescription("Show a member's verified Roblox profile")
    .addUserOption((option) => option.setName("user").setDescription("Discord member").setRequired(true)),
  async execute(interaction, context) {
    const user = interaction.options.getUser("user", true);
    const record = context.verification.getVerification(user.id);
    if (!record) return interaction.reply({ content: `${user} is not verified.`, ephemeral: true });
    return interaction.reply({ embeds: [profileEmbed(user, record)], ephemeral: true });
  }
};
