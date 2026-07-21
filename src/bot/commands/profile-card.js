const { EmbedBuilder } = require("discord.js");

function profileEmbed(user, record) {
  return new EmbedBuilder()
    .setColor(0x22c55e).setTitle("Roblox Verification Profile")
    .setThumbnail(record.roblox_avatar_url || null)
    .addFields(
      { name: "Discord", value: `<@${user.id}>`, inline: true },
      { name: "Status", value: "✅ Verified", inline: true },
      { name: "Roblox Username", value: record.roblox_username, inline: true },
      { name: "Display Name", value: record.roblox_display_name || record.roblox_username, inline: true },
      { name: "Roblox ID", value: record.roblox_id, inline: true },
      { name: "Verified", value: `<t:${Math.floor(Date.parse(record.verified_at) / 1000)}:F>`, inline: false }
    );
}

module.exports = { profileEmbed };
