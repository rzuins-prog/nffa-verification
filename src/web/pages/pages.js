const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[char]));

function page(title, heading, message, kind = "normal") {
  const icon = kind === "success" ? "✅" : kind === "error" ? "❌" : "🔒";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at top,#273559,#0b1020 65%);font:16px system-ui,sans-serif;color:#f8fafc}.card{width:min(92%,560px);padding:48px 36px;text-align:center;background:#151d31;border:1px solid #334155;border-radius:20px;box-shadow:0 24px 70px #0008}.icon{font-size:52px}h1{margin:18px 0 12px;font-size:30px}p{margin:0;color:#cbd5e1;line-height:1.7}</style></head><body><main class="card"><div class="icon">${icon}</div><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(message)}</p></main></body></html>`;
}

const landingPage = () => page("CFA Roblox Verification", "CFA Roblox Verification", "Securely connect your Roblox account to Discord. Use the verification link provided by the Discord bot.");
const errorPage = () => page("Verification Failed", "Verification Failed", "The verification link is invalid, already used, or the Roblox authorization failed. Return to Discord and request a new link.", "error");
const successPage = () => page("Verification Complete", "Verification Complete", "Your Roblox account has been connected successfully. You may now return to Discord.", "success");

module.exports = { landingPage, errorPage, successPage };
