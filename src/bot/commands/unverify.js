const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("unverify").setDescription("Disconnect your Roblox account"),
  async execute(interaction, context) {
    if (!context.verification.getVerification(interaction.user.id)) return interaction.reply({ content: "You are not verified.", ephemeral: true });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`unverify-confirm:${interaction.user.id}`).setLabel("Confirm unverify").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`unverify-cancel:${interaction.user.id}`).setLabel("Cancel").setStyle(ButtonStyle.Secondary)
    );
    return interaction.reply({ content: "Are you sure you want to disconnect your Roblox account?", components: [row], ephemeral: true });
  }
};
