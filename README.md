# CFA Roblox Verification

A Node.js service that securely links a Discord member to one Roblox account through official Roblox OAuth 2.0. It includes Discord slash commands, SQLite persistence, role/nickname synchronization, verification logs, and a small Express website.

## Install and configure

Use Node.js 20 or newer.

```bash
npm install
copy .env.example .env
```

Fill in `.env`; never commit that file. `DATABASE_PATH` defaults to `./data/verification.db`, and `SYNC_NICKNAMES` may be `true` or `false`.

## Discord setup

1. Create an application in the Discord Developer Portal and add a bot.
2. Enable the Server Members privileged intent.
3. Invite it with the `bot` and `applications.commands` scopes. Give it Manage Roles and, if nickname sync is enabled, Manage Nicknames.
4. Put the bot's highest role above both verification roles.
5. Copy the application ID to `DISCORD_CLIENT_ID`, server ID to `DISCORD_GUILD_ID`, token to `DISCORD_TOKEN`, and the role/channel IDs to their matching variables.
6. Register commands with `npm run register`, then start with `npm start`.

Commands are `/verify`, `/profile`, `/whois user`, `/unverify`, and administrator-only `/verify-panel`.

## Roblox OAuth setup

Create an OAuth 2.0 application in Roblox Creator Hub. Use the `openid profile` scopes. Register this callback exactly (including protocol, hostname, path, and absence of a trailing slash):

```text
https://nffa-verification.onrender.com/auth/callback
```

Set the Roblox client ID and secret in `.env`. `ROBLOX_REDIRECT_URI` must exactly equal the registered callback. Roblox secrets and OAuth tokens are never logged or stored.

For local end-to-end OAuth testing, register a local callback such as `http://localhost:3000/auth/callback`, then set `ROBLOX_REDIRECT_URI` to that exact value and `PUBLIC_VERIFY_URL=http://localhost:3000/verify`.

## Local testing

```bash
npm test
npm run check
npm run register
npm start
```

Open `http://localhost:3000/`, `/health`, or use the private link produced by `/verify`. Opening `/verify` without a valid token intentionally produces a styled HTTP 400 page.

## Render deployment

Create a Node web service connected to this repository:

- Build command: `npm install`
- Start command: `npm start`
- Add every variable shown in `.env.example` under Environment.
- Use `PORT=3000`; Render routes public traffic to the listening service.
- For durable SQLite data, attach a persistent disk and set `DATABASE_PATH` to a path on that disk. Without a disk, verification records can disappear on redeploy/restart.

Register the production slash commands once with the production environment configured: `npm run register`.

## Troubleshooting

**Cannot GET /verify:** Ensure Render runs `npm start` from this project and the deployment contains `src/web/server.js`. The implemented route returns a styled error—not Express's default message—when no valid token is supplied.

**Roblox redirect URI mismatch:** The value in `ROBLOX_REDIRECT_URI`, the Roblox application callback, and the callback used for the current environment must match character-for-character. Production should use `https://nffa-verification.onrender.com/auth/callback`.

**Discord role errors:** Confirm Manage Roles is granted, the bot's role is above Verified and Unverified, IDs are from the intended server, and the bot is still a member. Nickname errors do not roll back verification.

## Security behavior

Verification URLs contain a random one-time token, never a Discord ID. Sessions expire after 15 minutes, a new `/verify` replaces the user's previous token, OAuth state is validated, consumed links cannot be reused, and database queries are parameterized. One Discord account and one Roblox account can each participate in only one link.
