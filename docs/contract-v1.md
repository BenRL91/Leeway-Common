# Notifications integration contract v1

Package version 0.1.0. Event and inbox protocol version 1. Unknown contract version/type/extra fields rejected. Only Replay production events enabled in code; producer credentials are not configured yet. No draft or arbitrary-link event type.

## Event producer

`POST /v1/events`, JSON, server-to-server only. HMAC-SHA256 signature over exact UTF-8 bytes:

```
<13-digit Unix milliseconds>\nPOST\n/v1/events\n<exact request body>
```

Headers: `x-leeway-producer: replay`, `x-leeway-timestamp: <milliseconds>`, `x-leeway-signature: <64 lowercase hex chars>`. Five-minute freshness window. TLS required. Retries re-sign identical logical payload with a fresh timestamp; `eventId` must remain stable. Replay uses its own dedicated producer key, never the Supabase public key. Other producers are rejected independently of event data.

```json
{
  "contract":"leewaypb.notifications.event",
  "version":1,
  "app":"replay",
  "eventId":"review:11111111-1111-4111-8111-111111111111:release:7",
  "type":"replay.review.updated",
  "occurredAt":"2026-10-08T17:00:00.000Z",
  "actorSubject":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "recipients":[{"verifiedEmail":"player@example.com"}],
  "target":{
    "reviewId":"11111111-1111-4111-8111-111111111111",
    "releaseId":"2026-10-08T17:00:00.000Z"
  }
}
```

Recipients: one to ten selectors, each exactly `{subject: Supabase UUID}` or `{verifiedEmail: canonical email}`. Do not supply legacy Sites IDs, `supabase_` storage prefixes, or PaddleLog app-account IDs as Supabase subjects. The actor is the verified Supabase subject; suppress self notifications. If recipient UUID is unknown, the committed released audience email is supported and matched only against server-confirmed Supabase email. No auth user enumeration is required.

Types:

| Type | Stable event ID recipe | Target |
|---|---|---|
| `replay.question.created` | `discussion:<committed entry UUID>:created` | reviewId, current releasedAt as releaseId, entryId, at, optional threadId |
| `replay.reply.created` | `discussion:<committed entry UUID>:created` | same; category must be Reply |
| `replay.review.released` | `review:<review UUID>:release:<committed revision>` | reviewId, releasedAt as releaseId |
| `replay.review.updated` | same revision recipe | reviewId, releasedAt as releaseId |

All timestamps: exact ISO UTC with millisecond precision. `at` is a finite number 0–604800 seconds. `threadId` and `entryId` are UUIDs; entry required for question/reply. Do not send message bodies, draft text, titles, payment details, URLs or role claims.

Service access checks verify event release generation and current entry category/time/thread membership against Replay, not just that the caller has any review. Released update notices include no note text. Updating a saved draft generates **no event**, even if the review has an earlier released version.

200: `{accepted:true,duplicate:false|true}`. 400 invalid contract/body; 401 invalid signature; 403 producer disabled; 409 conflicting payload under same event ID; 413 oversized body; 503 not configured/storage unavailable. Treat 429/5xx/timeouts as retryable with exponential backoff/jitter; validation/conflict/permission errors need attention. Never generate a new event ID just to evade 409.

## User API

All calls require `Authorization: Bearer <Supabase access token>` validated with existing issuer’s `getUser`. An unauthenticated request never receives a count/row. Allowlisted CORS does not confer authorization. Cookie-authenticated host proxies must enforce their existing CSRF/admission checks.

| Method / path | Request | Response |
|---|---|---|
| GET `/v1/inbox?cursor=<opaque>` | none | `contract: leewaypb.notifications.inbox`, `version:1`, 25 accessible items, global accessible unreadCount, nextCursor, preferences |
| PUT `/v1/notifications/:encoded-id/read` | `{read:boolean,version:integer}` | `{read,version:next}` |
| GET `/v1/notifications/:encoded-id/open` | none | rechecked `{destination,target}` |
| GET `/v1/preferences` | none | `{inApp,version,email:{available:false,enabled:false},push:{available:false,enabled:false}}` |
| PUT `/v1/preferences` | `{inApp:boolean,version:integer}` | saved preferences |

Inbox item: `{id,app,type,title,createdAt,read,version,target,destination}`. `id` is opaque; always percent-encode it. `title` is service-owned generic text. Use `textContent`, never HTML interpolation. Preferences affect badge display, not event production or inbox history. Concurrent stale updates return 409; refresh before user retries. Not-owned/inaccessible resources return indistinguishable 404, no metadata. Destination outage returns 503 and suppresses stale inbox content.

The service returns fixed-origin Replay paths with query `at`, `entry`, `thread`, and `release`. The app worker must consume these after its own access check. No client-provided destination URL or callback grant is accepted. Inbox responses and writes are private/no-store.

## Outbox obligation

An HTTP call alone is not a reliable app event producer. Persist a stable outbox event with the committed source operation, then deliver from that outbox; acknowledge only the committed notification response. For Replay’s R2 operation, attach an immutable event descriptor/outbox marker to the same ETag-controlled review or discussion record. A follow-up reconciler lists undelivered committed records, retries their stable events, and records delivery separately. Never emit before the R2 commit, and never let a notification outage roll back a successfully posted question/released review. Until replay’s outbox and reconciler are implemented and tested, integration is not live.
