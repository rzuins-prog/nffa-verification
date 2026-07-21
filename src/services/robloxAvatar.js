async function getRobloxAvatar(userId, fetchImpl = fetch) {
  const url = new URL("https://thumbnails.roblox.com/v1/users/avatar-headshot");
  url.search = new URLSearchParams({ userIds: String(userId), size: "420x420", format: "Png", isCircular: "false" });
  const response = await fetchImpl(url);
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.data?.[0]?.state === "Completed" ? payload.data[0].imageUrl : null;
}

module.exports = { getRobloxAvatar };
