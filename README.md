# LeewayPB Library — 0.1.0

One curated module: **Notifications**. Framework-independent Shadow DOM island, supporting notification service, owner-protected demonstration, and worker handoffs. No GitHub integration, registry account, third-party delivery provider, or shared-auth changes.

## Status

| Part | Status |
|---|---|
| Bell, inbox, read/unread, preferences, lifecycle | Implemented |
| Dedicated Sites Worker + D1 storage | Implemented |
| Supabase `getUser` validation + per-destination access | Implemented |
| Replay released-review and visible-discussion access adapter | Implemented against existing read-only routes; test doubles verified |
| Replay event generation/outbox, app mounting, deep-link consumer | Published by Replay worker at `7220e2b`; disabled pending its activation |
| Coaching mounting/events/admission/access adapter | Proposed worker handoff |
| PaddleLog and Pickle Point mounting | Proposed worker handoffs; no event catalogs invented |
| Email and push delivery | Disabled; roadmap only |

Demo: https://leewaypb-library.leeohsunshine.chatgpt.site — owner-protected demo; authenticated `/v1` API is reachable without Sites gating. Load sample events, mark read, refresh both hosts, reload the page, revoke sample access, mount/unmount during playback. Synthetic fixtures are separate from production subjects and events. Never interpret the demo’s two panels as implemented app integrations.

## Project boundaries

- `packages/notifications`: pinned package `@leewaypb/notifications@0.1.0`; browser island/transport, server-only producer helper.
- `service`: event ingestion, persistent inbox/preferences/read status, identity validation and destination authorization.
- `db/schema.ts`, `drizzle`: owned notification schema, never another app’s schema.
- `demo`: synthetic owner demonstration, playback fixture and separate owner identity namespace.
- `docs`: installation, architecture, contracts, verified baseline, future delivery path, individual worker handoffs.

Use `npm ci`, `npm test`, `npm run build`, `npm run pack:notifications`. Generated deployment is a Worker, not a React application. Drizzle owns schema migrations. No runtime DDL.

See [installation](docs/installation.md), [architecture](docs/architecture.md), [contract](docs/contract-v1.md), [verification](docs/verification.md), and [curation](docs/curation.md).

Activation coordination: [Replay readiness](docs/replay-activation-readiness.md).
