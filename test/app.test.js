const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createDatabase } = require("../src/database/database");
const { createVerificationService } = require("../src/services/verification");
const { createApp } = require("../src/web/server");
const profileCommand = require("../src/bot/commands/profile");

async function fixture() {
  const db = createDatabase(":memory:");
  const verification = createVerificationService(db);
  const config = { robloxClientId: "client", robloxRedirectUri: "http://localhost/auth/callback" };
  const oauth = {
    authorizationUrl: (state) => `https://apis.roblox.com/oauth/v1/authorize?state=${state}`,
    exchangeCode: async () => ({ access_token: "test-access-token" }),
    getProfile: async () => ({ sub: "100", preferred_username: "Builder", nickname: "Builder Display" })
  };
  const app = createApp({ config, verification, oauth, getAvatar: async () => "https://example.com/avatar.png" });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  return { db, verification, server, base };
}

test("website routes and verification security", async (t) => {
  const f = await fixture();
  t.after(() => { f.server.close(); f.db.close(); });

  await t.test("GET / returns landing page", async () => {
    const response = await fetch(`${f.base}/`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /CFA Roblox Verification/);
  });
  await t.test("health returns HTTP 200", async () => {
    const response = await fetch(`${f.base}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, service: "CFA Roblox Verification" });
  });
  await t.test("verify without token is a styled 400 page", async () => {
    const response = await fetch(`${f.base}/verify`);
    assert.equal(response.status, 400);
    const text = await response.text();
    assert.match(text, /Verification Failed/);
    assert.doesNotMatch(text, /Cannot GET/);
  });
  await t.test("invalid token is rejected", async () => assert.equal((await fetch(`${f.base}/verify?token=bad`)).status, 400));
  await t.test("valid token redirects to official Roblox OAuth", async () => {
    const token = f.verification.createSession("discord-1");
    const response = await fetch(`${f.base}/verify?token=${token}`, { redirect: "manual" });
    assert.equal(response.status, 302);
    assert.match(response.headers.get("location"), /^https:\/\/apis\.roblox\.com\/oauth\/v1\/authorize/);
  });
  await t.test("OAuth state mismatch is rejected", async () => {
    const response = await fetch(`${f.base}/auth/callback?code=x&state=wrong`);
    assert.equal(response.status, 400);
  });
  await t.test("callback route without OAuth parameters is a styled 400 page", async () => {
    const response = await fetch(`${f.base}/auth/callback`);
    assert.equal(response.status, 400);
    assert.match(await response.text(), /Verification Failed/);
  });
  await t.test("consumed token cannot be reused", async () => {
    const token = f.verification.createSession("discord-2");
    const state = f.verification.setOAuthState(token);
    const response = await fetch(`${f.base}/auth/callback?code=x&state=${state}`);
    assert.equal(response.status, 200);
    assert.equal((await fetch(`${f.base}/verify?token=${token}`)).status, 400);
  });
});

test("database enforces one-to-one account links", () => {
  const db = createDatabase(":memory:");
  const service = createVerificationService(db);
  const makeSession = (discord) => { const token = service.createSession(discord); service.setOAuthState(token); return service.getUsableSession(token); };
  service.complete(makeSession("d1"), { sub: "r1", preferred_username: "One" }, null, null);
  assert.throws(() => service.complete(makeSession("d2"), { sub: "r1", preferred_username: "One" }, null, null), /already linked/);
  assert.throws(() => service.complete(makeSession("d1"), { sub: "r2", preferred_username: "Two" }, null, null));
  db.close();
});

test("profile handles verified and unverified users", async () => {
  const replies = [];
  const interaction = { user: { id: "d1" }, reply: async (value) => replies.push(value) };
  await profileCommand.execute(interaction, { verification: { getVerification: () => undefined } });
  assert.match(replies.pop().content, /not verified/);
  await profileCommand.execute(interaction, { verification: { getVerification: () => ({
    discord_id: "d1", roblox_id: "r1", roblox_username: "One", roblox_display_name: "Display", roblox_avatar_url: null, verified_at: new Date().toISOString()
  }) } });
  assert.equal(replies.pop().embeds[0].data.title, "Roblox Verification Profile");
});
