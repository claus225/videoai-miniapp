# KREA STUDIO API — foundation

This folder contains the separate server-side foundation for KREA STUDIO.
The React/Vite site remains a static GitHub Pages frontend.

## Current status

- Cloudflare Worker health endpoint: implemented.
- D1 schema for social connections and scheduled posts: drafted.
- OAuth: not implemented.
- Token encryption/decryption: not implemented.
- Automatic publishing and cron scheduler: not implemented.
- Analytics and comment APIs: not implemented.

The API intentionally does not accept social passwords or OAuth tokens yet.

## Local preparation

1. Install Node.js and Wrangler on a development computer.
2. Create a Cloudflare D1 database in the intended Cloudflare account.
3. Copy its database ID into `wrangler.toml`.
4. Apply the migration with `npx wrangler d1 migrations apply krea-studio-db --local`.
5. Run the Worker locally with `npx wrangler dev`.

Do not deploy this foundation as a production publishing service. It is not yet authenticated and cannot publish content.

## Security rules

- Never put OAuth client secrets, access tokens, refresh tokens, or encryption keys in frontend files or Git.
- Store token ciphertext only; encryption/decryption must happen on the server using a dedicated secret.
- Add user authentication and ownership checks before exposing account or post data.
- Use only official platform OAuth and APIs.
- Implement platform-specific permission checks, retries, rate limits, and audit logs before enabling scheduled publishing.

## GitHub Pages

The existing Pages workflow builds only the frontend. This Worker is deployed separately and is not activated by a frontend deployment.
