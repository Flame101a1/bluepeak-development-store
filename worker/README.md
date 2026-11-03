# Free resource-tracking service

This Worker stores only public package-to-resource-name mappings and short-lived
owner sessions. It has no HTML pages or dashboard. Keep the Cloudflare account on
Workers Free; no Firebase billing, private Tebex key, or DNS migration is needed.

## Deployment

1. Sign into the owner's Cloudflare account on the Free plan.
2. Create a Workers KV namespace for this service. Put its returned ID in
   `wrangler.jsonc` (binding `DATA`).
3. Deploy this directory using the official Wrangler CLI or Cloudflare dashboard.
4. Set the returned HTTPS Worker URL as `trackingEndpoint` in `js/config.js`.
5. Run Node and browser checks, then test actual CFX authorization and a save before
   publishing the storefront. Keep the endpoint blank until verification succeeds.

The storefront stays on GitHub Pages. The service may use its `workers.dev`
address; changing the storefront's nameservers is unnecessary.

## Identity and permissions

The existing Tebex basket is not an admin credential. Its CFX ID is used only to
decide whether to start extra owner verification after the normal customer login.
The editor is rendered only after both the current basket and the backend session
identify `fivem:8168011`.

Owner verification follows CFX's recommended Discourse user API flow with only
`session_info`. The browser generates a temporary RSA-OAEP key pair and nonce.
CFX encrypts its return value to that browser's public key. The callback removes
the encrypted payload from the address immediately, checks its nonce and ten-minute
expiry, and consumes the browser's pending challenge once.

The Worker independently queries CFX's `/session/current.json` with the returned
credential. Only exact numeric user ID `8168011` can create a session. It attempts
to revoke the CFX credential immediately and never stores or returns it. Owner
session tokens contain 256 random bits, are stored hashed in KV, expire after six
hours, and are checked on every write. Browser session storage contains the
temporary challenge and session token, never a permanent CFX password or key.

Every write also requires the configured storefront origin. This origin check is
additional protection, not a substitute for server-side authentication. Arbitrary
claims, basket identifiers, forged browser state, other accounts, expired tokens,
and malformed resource names cannot authorize writes.

Public `/mappings` exposes resource names only. The scheduled Pages job queries
5Metrics for the exact configured names. A saved name does not isolate metrics
for one seller when several products share the same runtime name; generic names
such as `qb-inventory` can include other implementations.

KV propagates updates asynchronously, so another location can take about a minute
to see a saved mapping. The editing page keeps its successful save immediately.
Public usage counts retain the existing roughly 30-minute refresh schedule.

## Verification

Run `node --test tests/*.test.mjs` from the repository root. Open
`http://127.0.0.1:8080/tests/browser.html` using `node scripts/serve.mjs` to run
isolated browser checks. Fixtures are not included in the staged deployment.

Real account authorization, actual Worker requests, and free-plan settings must
also be checked before deployment is considered complete.
