# KREA STUDIO — Security policy and release gates

Security is a release blocker, not a feature to add later. This document describes the current foundation and the controls required before real user data or social accounts are enabled.

## Current scope

The backend is an integration prototype. The MCP endpoint is protected by one shared bearer secret. The MCP server exposes only a read-only status tool. This is suitable only for controlled development tests, not public multi-user production.

Implemented in the current work branch:
- The bearer secret is read from a Worker secret, never from source control.
- Secret comparison uses SHA-256 digests and a fixed-length byte comparison.
- Requests with an Origin header must match the exact comma-separated `KREA_MCP_ALLOWED_ORIGINS` allowlist.
- MCP accepts only `application/json` requests.
- MCP request bodies are limited to 1 MiB, including requests without Content-Length.
- Responses set no-store and baseline browser security headers.
- Automated tests and CI workflow are prepared; a green CI run must still be observed before release.

## Production blockers

Do not connect real social accounts, store personal data, or enable publishing until all of the following are implemented and independently tested:

1. **User identity:** established authentication, secure session lifecycle, session revocation, and account recovery.
2. **Authorization:** deny-by-default server-side ownership checks on every user, workspace, post, and connected account. Never trust a user ID supplied by the browser.
3. **Secrets and tokens:** encrypt OAuth access and refresh tokens at rest with managed keys; separate encryption keys from the database; define rotation and revocation procedures.
4. **OAuth safety:** use official platform OAuth, validate state and redirect URIs, request minimum scopes, and verify callback ownership.
5. **MCP isolation:** replace the shared bearer token with per-user identity and authorization before exposing private data or write-capable tools.
6. **Abuse controls:** rate limits, request quotas, replay protections where applicable, bounded payloads, and safe retry behavior.
7. **Auditability:** record security-relevant events without logging passwords, bearer tokens, OAuth codes, or private content.
8. **Browser and transport:** HTTPS only, exact trusted-origin configuration, restrictive Content Security Policy, and reviewed CORS behavior.
9. **Data lifecycle:** documented retention, export, deletion, backup, and restore procedures.
10. **Operational readiness:** dependency scanning, secret scanning, reviewed migrations, monitoring, incident response, and tested recovery.

## Release rules

- No secrets in Git, frontend bundles, logs, screenshots, or issue comments.
- No production deployment or paid service activation without explicit project-owner approval.
- No social publishing without a separate user confirmation flow that shows the exact content, destination, and scheduled time.
- A passing unit test suite is necessary but does not prove the service is secure. Require code review and deployment configuration review too.
- Keep the production publishing feature disabled until every applicable production blocker above is satisfied.

## Reporting

Report suspected vulnerabilities privately to the project owner. Do not publish exploit details, tokens, personal data, or production identifiers in public issues.
