# Architecture and inspected baseline

Inspected all four **read-only Sites checkouts** on 2026-10-08. No app files, configuration, deployment, or payments changed. Sites source synchronization is the built-in workflow, not GitHub.

| App | Inspected source revision | Stack / storage / identity |
|---|---|---|
| Replay | `6bfead6dd11acc2d6b46ca2b5997373d17391488` | Plain JS + esbuild Worker; R2; Supabase validated server-side; HttpOnly access/refresh cookies; released grants and discussion audiences |
| Coaching | `25c1b31603c0e16999be8f6dd8e959ff5b4ae2da` | Plain JS Worker; D1 + R2; inspected code uses Sites owner identity / booking tokens, not a Supabase user session |
| PaddleLog | `1a7aa7c2c6722b9037471bc591612de129e03c88` | React 19 / Vinext, D1 + R2, Supabase subject mapped to application account; HttpOnly web cookies; native bearer flow |
| Pickle Point | `1792eb5f501a88316c067bb46b1233709ec5e101` | Plain ES modules, Worker + D1; Supabase bearer; PaddleLog beta-admission authority; offline scoring shell |

Relevant source: Replay `app/server/auth.mjs`, `app/server/replay.mjs`, `app/web/replay.js`, `app/web/appearance.js`, `app/palette.css`, `build.mjs`; Coaching `worker/index.js`, `worker/breakdowns.js`, `worker/records.js`, `scripts/build.mjs`; PaddleLog `lib/server/web-session.ts`, `app/api/auth/session/route.ts`, `public/appearance.js`; Pickle Point `server/library.js`, `server/beta.js`, `web/leeway-auth.js`, `scripts/build.mjs`.

## Choices

A small plain-JS package fits all four without a common framework or shared app release train. Vendor the pinned package into each host or install its local tarball. No dependency on a mutable remote script. Hosts can retain a working prior version if the service or a newer package fails.

Use a dedicated **Sites Worker and notification-owned D1 binding**. This matches supported deployment workflows, avoids a new paid provider, and leaves the existing Supabase project auth-only. There is no public database API; all D1 access goes through prepared SQL in this service. Supabase public key validates users through `/auth/v1/user`; no admin/service-role key is needed. No Supabase configuration/schema changed.

Identity does not grant app access. Every inbox scan, unread count, read update, and open action requires both a matching notification recipient and a successful current destination access check. Replay’s existing `/api/replay/view/:id` checks grants and released state; `/discussion` checks source and entry audience. This service sends the user’s validated access token to the fixed Replay origin as its existing access cookie. Redirects are not followed; failure, timeout, or unexpected output fails closed. Requests are GET only, never call draft/owner/write routes, and never share R2 or application DB bindings.

Only generic titles and target IDs/timestamps are persisted. No review title, note body, draft, order data, video, or author label is stored. Released response bodies are used ephemerally for access checks, never persisted/logged. Release generation must exactly match the event’s release timestamp. Inaccessible entries disappear from results and counts. Old-release events are conservatively hidden after any new release.

## Consistency and lifetime

- One atomic event+recipient batch; unique `app:eventId` and canonical digest. Identical retries acknowledge the prior commit. Reusing an ID with different data returns 409.
- One read state per `eventKey + Supabase subject`, regardless of recipient selector or app. CAS versions prevent stale tabs overwriting newer status. Clients refresh on 409.
- Recipient selectors may be Supabase UUIDs or confirmed emails hashed before persistence. Email notification selectors only match the email returned as confirmed by Supabase `getUser`, never browser metadata. Email matching supports Replay’s existing email grants without enumerating auth users.
- Stable server-received cursor order and 25-item pages. Unread count includes all authorized items, not just the visible page.
- Current v1 safety bound: scans at most 1,000 candidate events per user, six concurrent destination checks, with per-request shared review/thread lookups. Larger inboxes fail closed with `INBOX_SCAN_LIMIT`; before scaling beyond this, implement a retention/archive policy and purpose-built batch authorization endpoint with Replay’s worker. No approximate unread count is presented as exact.
- Polling every 30 seconds and on visibility return; no realtime subscription or billable delivery feature. Network-offline state is recoverable. There is no offline inbox cache.
- Already-rendered generic metadata is removed on the next refresh after remote revocation, up to 30 seconds in a visible tab. All opens/read updates recheck immediately. Hidden tabs clear the rendered inbox. Revocation cannot retroactively erase content already seen.
- The shared Site permits API ingress without a Sites owner gate; the Worker independently keeps demo assets and records owner protected. Supabase/HMAC authorization remains mandatory on `/v1`. Replay activation is owned by its worker after coordination.

## Styling and playback

Shadow DOM isolates CSS; prefixed `--ln-*` internal variables consume optional `--lr-*` host palette tokens. Native dialog provides focus containment/Escape; 44px targets, readable labels, no global CSS/scroll changes. Observe host `data-appearance` and system color preference; never change host appearance storage. The island appends only its own element, aborts requests on destroy/session reset, removes listeners/timers/observers, and never invokes a video API. Opening the inbox does not pause playback. The optional host `onNavigate` handles an authorized target without remounting a current player.
