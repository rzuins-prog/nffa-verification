const express = require("express");
const { landingPage, errorPage, successPage } = require("./pages/pages");

function createApp({ config, verification, oauth, getAvatar, completeDiscordVerification = async () => {} }) {
  const app = express();
  app.disable("x-powered-by");

  app.get("/", (_req, res) => res.status(200).type("html").send(landingPage()));
  app.get("/health", (_req, res) => res.status(200).json({ ok: true, service: "CFA Roblox Verification" }));
  app.get("/verify", (req, res) => {
    const session = verification.getUsableSession(req.query.token);
    if (!session) return res.status(400).type("html").send(errorPage());
    const state = verification.setOAuthState(session.token);
    return res.redirect(302, oauth.authorizationUrl(state));
  });
  console.log("[WEB] GET /verify registered");

  app.get("/auth/callback", async (req, res) => {
    try {
      if (req.query.error || !req.query.code || !req.query.state) throw new Error("Invalid callback");
      const session = verification.findByState(req.query.state);
      if (!session) throw new Error("Invalid OAuth state");
      const tokens = await oauth.exchangeCode(req.query.code);
      if (!tokens.access_token) throw new Error("Missing access token");
      const profile = await oauth.getProfile(tokens.access_token);
      if (!profile?.sub || !(profile.preferred_username || profile.name)) throw new Error("Invalid Roblox profile");
      const avatarUrl = await getAvatar(profile.sub);
      const record = verification.complete(session, profile, avatarUrl, null);
      try { await completeDiscordVerification(record); } catch (error) { console.error("[DISCORD] Post-verification update failed:", error.message); }
      return res.status(200).type("html").send(successPage());
    } catch (error) {
      console.error("[WEB] Verification callback failed:", error.message);
      return res.status(400).type("html").send(errorPage());
    }
  });
  console.log("[WEB] GET /auth/callback registered");

  app.use((_req, res) => res.status(404).type("html").send(errorPage()));
  app.use((error, _req, res, _next) => {
    console.error("[WEB] Request failed:", error.message);
    if (!res.headersSent) res.status(500).type("html").send(errorPage());
  });
  return app;
}

module.exports = { createApp };
