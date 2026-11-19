# KREA STUDIO API — integration foundation

This folder contains the separate server-side foundation for KREA STUDIO.
The React/Vite site remains a static GitHub Pages frontend.

## Current status

- Cloudflare Worker health endpoint: implemented.
- D1 schema for social connections and scheduled posts: drafted.
- Remote MCP Streamable HTTP route: read-only status tool implemented; not deployed.
- MCP authentication: bearer-secret gate with constant-time digest comparison; configure a secret before use.
- MCP browser-origin allowlist: requests carrying an `Origin` header are rejected unless the exact origin is listed in `KREA_MCP_ALLOWED_ORIGINS`.
- API responses include no-store and basic browser security headers; MCP accepts JSON requests only and applies a declared-body-size limit.
- In-app Claude/OpenAI assistant screen: interface added; model calls are not active.
- Claude and OpenAI API adapters: not implemented.
- Social OAuth, token encryption, automatic publishing, analytics and comments: not implemented.

The API does not accept social passwords or OAuth tokens. The MCP tool currently exposes only KREA's integration status; it cannot read private account data or change/publish social content.

## MCP gateway

The initial MCP tool is deliberately read-only. Before testing, set a long random `KREA_MCP_TOKEN` as a Cloudflare Worker secret. Never commit it to Git or put it in frontend code.

The bearer-secret gate is an initial private test gate, not a substitute for full per-user OAuth authorization. Set `KREA_MCP_TOKEN` as a Worker secret. If browser-based MCP clients are expected, configure `KREA_MCP_ALLOWED_ORIGINS` as a comma-separated list of exact trusted origins (scheme and host, including port when used). Requests without an `Origin` header remain available for non-browser MCP clients; requests that include an origin are denied unless it matches the allowlist exactly. Before production, add per-user OAuth authorization, per-user scopes, audit logs, host validation, and tool-level approvals.

Claude supports remote custom MCP connectors on individual plans. ChatGPT's direct custom MCP connection is currently restricted by OpenAI to Business and Enterprise/Edu workspaces; Free users cannot connect this custom server directly. KREA can still integrate OpenAI models server-side through the OpenAI API, independently of ChatGPT plan access.

## In-app AI assistants

The KREA interface now has an Assistants IA screen for Claude and OpenAI. It is a preparation screen only; no model request is sent yet.

The future integration must:
- Call Anthropic and OpenAI APIs from the backend only.
- Keep API keys in Cloudflare Worker secrets, never in frontend code.
- Require authenticated user sessions and usage limits before enabling requests.
- Ask for explicit confirmation before any assistant can request a social write action.

API usage is separate from ChatGPT or Claude subscriptions and may incur separate charges. Do not enable paid API usage until the budget and account owner have been confirmed.

## Local preparation

1. Install Node.js and Wrangler on a development computer.
2. Create a Cloudflare D1 database in the intended Cloudflare account.
3. Copy its database ID into `wrangler.toml`.
4. Install backend dependencies from this folder with `npm install`.
5. Apply the migration with `npx wrangler d1 migrations apply krea-studio-db --local`.
6. Run the Worker locally with `npm run dev`.

Do not deploy this foundation as a production publishing service. It is not yet authenticated for individual users and cannot publish content.

## Security rules

- Never put OAuth client secrets, access tokens, refresh tokens, or encryption keys in frontend files or Git.
- Store social token ciphertext only; encryption/decryption must happen on the server using a dedicated secret.
- Add user authentication and ownership checks before exposing account or post data.
- Use only official platform OAuth and APIs.
- Implement platform-specific permission checks, retries, rate limits, and audit logs before enabling scheduled publishing.

## GitHub Pages

The existing Pages workflow builds only the frontend. This Worker is deployed separately and is not activated by a frontend deployment.


## Backend tests

From the `backend` directory, run:

```bash
npm install
npm test
```

The tests cover health status, missing/invalid MCP credentials, HTTP method and media-type checks, browser-origin allowlisting, and response security headers. The GitHub Actions workflow also runs the frontend build and backend tests on pushes and pull requests.
