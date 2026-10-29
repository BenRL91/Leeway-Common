# Verification evidence — 2026-10-08

`npm test` covers the implemented island, HTTP Worker and service with real SQLite schema/queries through a D1-shaped adapter. Tests use synthetic identities and mocked Supabase/Replay HTTP responses; no auth users, customer records, emails or push were created.

- Atomic duplicate ingestion and immutable conflicting-event rejection.
- Source-contract rejects drafts, other producers and arbitrary destination URL fields.
- Database file close/reopen proves durable inbox/read status; a second service instance sees the same state.
- Read CAS prevents stale tabs overwriting newer read/unread status.
- Recipient enforcement for inbox, unread count, read and open; unrelated subjects see zero metadata.
- Current revoked/missing review, draft/preview state, different release and hidden thread are excluded; destination outages fail closed.
- Supabase must validate actual bearer; anonymous or unverified email/metadata confer no matching grant.
- Dedicated producer HMAC validates app, timestamp and exact bytes; stale/tampered payload rejected.
- Owner demo identity and synthetic namespace cannot authorize production notifications.
- HTTP demo seed/read/reload/open/revoke; duplicate seed remains three rows; same-origin CSRF required.
- HTTP missing/invalid bearer and unconfigured producer rejected; CORS origin does not grant access.
- Durable preference state; email/push disabled.
- Shadow-root style isolation, host theme observation, mount/open/close/destroy preserves video element and its host state.
- In-flight requests aborted/late responses ignored after unmount; escaped external text; inaccessible notifications removed on refresh.
- Browser transport obtains a fresh token each request, no token persistence; cookie-proxy mode does not expose a token.

All four app checkouts reported clean `git status --porcelain` after inspection. Shared Supabase public table inventory remained empty; project serves identity, no new notification tables/auth changes were installed there.

## Limits on the evidence

Producer credential and public API reachability are now verified by live signed synthetic ingestion/duplicate probes. Real approved-user Supabase→Replay authorization still awaits Replay worker activation and signed-in test sessions. They are not claimed live. The implementation tests exercise real service logic against deterministic destination responses, including deny/revoke/error states.

No compatible supervised browser preview is available for this standalone Worker project. Native browser visual QA, actual running-video continuity and iPhone dialog/keyboard behavior remain to verify in Replay’s worker; DOM lifecycle tests prove no playback element/state mutations, not device playback behavior. The deployed owner demonstration includes a synthetic playable clip to perform that check.

A successful Sites deployment confirms Worker/migration publication. Demo data is created only when owner clicks Load sample events. Local SQL persistence tests do not claim real customer Supabase sessions or seeded production database notifications.

Latest coordination and current Replay-handler integration evidence: [Replay activation readiness](replay-activation-readiness.md).
