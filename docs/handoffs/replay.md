> Coordination update: Replay worker has published its integration at `7220e2bacb92cfa83d59a50b9b76f4c868f1f352`. Shared API reachability and the matching masked secret are now ready. Use `docs/replay-activation-readiness.md` for activation; the original implementation brief below is retained for reference.

# Copyable handoff — Leeway Replay worker

Implement Replay’s first integration with the shared LeewayPB Notifications module. The library/service project is owned separately; modify **Replay only** for this handoff, not Coaching, PaddleLog, Pickle Point, shared Supabase configuration or payments. Do not add GitHub integration. Do not send emails/push, enable billable features or provision paid services.

Shared project: `appgprj_6ac7d23a57fc8191a106a2af53a10a20`; demo/service origin `https://leewaypb-library.leeohsunshine.chatgpt.site`; pinned `@leewaypb/notifications@0.1.0`. Full contract: `/docs/contract-v1.md` in the shared project. Service is currently owner-only and `REPLAY_PRODUCER_SECRET` is not configured. Coordinate service reachability and a dedicated producer key with its owner before activating traffic. Do not bypass the owner gate or ship a bypass/producer token in the browser.

## What already exists

Shared package: bell, count, inbox, read/unread, in-app preferences, Shadow DOM, host appearance, mount/destroy and transport. Shared service: Supabase user validation, notification-owned D1, signed/idempotent ingestion, central read status, Replay current released-review and visible-entry checks. Owner demonstration uses synthetic fixtures only. **No Replay event generation, bell mounting or deep-link consumption has been implemented.**

Inspected baseline: `6bfead6dd11acc2d6b46ca2b5997373d17391488`. Re-read current source before editing; do not revert newer work. Relevant seams: `app/server/replay.mjs`, `app/server/auth.mjs`, `app/server/worker.mjs`, `app/web/replay.js`, `app/web/replay.html`, `app/web/appearance.js`, `app/palette.css`, `build.mjs`.

## Mount and proxy

Vendor `island.js` and `transport.js` under `/shared/notifications/0.1.0/`, add them to the existing build asset map, and mount an isolated header container outside `root.replaceChildren` and outside the playback/workspace lifecycle. Do not initialize another Supabase browser client or move Replay’s HttpOnly tokens into JS.

```js
import {mountNotifications} from '/shared/notifications/0.1.0/island.js';
import {createTransport} from '/shared/notifications/0.1.0/transport.js';
const island = mountNotifications(document.getElementById('notifications'), {
  request:createTransport({baseUrl:'/api/notifications'}),
  appearance:'host',
  onNavigate: openAuthorizedReplayNotificationTarget
});
// On sign-out/account change: destroy or immediately resetSession after transport changes.
// On actual host teardown: island.destroy().
```

Implement same-origin `/api/notifications/*` proxy. Preserve `resolveAuth`, tester admission and session rotation. Expose the current active access token internally in the server auth result only; never serialize it in `/api/auth/session`. Forward allowlisted GET inbox/preferences/open and PUT read/preferences to the fixed shared `/v1` paths using the current Supabase bearer. Merge rotated auth cookies into the response. Use existing same-origin CSRF controls for PUT; strip browser-supplied producer/identity/Cookie/dispatch headers, bound request bytes, no redirects, no-store, and safe timeout. Shared service does its own validation and destination authorization.

## Commit-safe event generation

Replay owns questions, replies and released review updates. Emit no event for draft save, player preview, private notes, or unsuccessful operation. Emit only after committed state and only to current released audience / conversation audience. Actor is `resolveAuth(...).user.id` (Supabase UUID), not `COACH_ID`, the `supabase_` storage prefix, or request metadata.

Attach an immutable notification-outbox descriptor to the **same ETag-controlled R2 commit** as a release or discussion record. For releases, store enough immutable pending-event history so a later draft/release cannot overwrite an undelivered event. For discussions, embed the event with the committed entry. Deliver after commit through the server-only producer helper; persist delivery acknowledgement separately. Implement a reconciler to list committed undelivered descriptors, retry with exponential backoff/jitter and stable IDs, and surface permanently failed entries to owner. Notification outage must not turn a successful post/release into an error that encourages users to repost. Coordinate any desired recurring scheduling; do not automatically create a paid job.

Event protocol:

```js
const event = {
  contract:'leewaypb.notifications.event', version:1, app:'replay',
  eventId:`discussion:${committedEntry.id}:created`,
  type:committedEntry.category==='Reply'
    ? 'replay.reply.created' : 'replay.question.created',
  occurredAt:committedEntry.createdAt,
  actorSubject:verifiedSupabaseSubject,
  recipients:[{verifiedEmail:committedReleasedRecipientEmail}],
  target:{
    reviewId:committedReview.id, releaseId:committedReview.releasedAt,
    entryId:committedEntry.id, at:committedEntry.at,
    ...(committedEntry.thread ? {threadId:committedEntry.thread.id} : {})
  }
};
```

Choose recipients from server-committed records. Player questions/replies notify Coach Lee’s confirmed email or known Supabase UUID; coach replies notify the intended viewer from the committed entry audience. Suppress the actor and never notify an earlier release’s different audience. Emit only Question/Reply categories in v1; other note categories remain silent.

Release IDs: `review:<UUID>:release:<committed revision>`, type `replay.review.released` for first release, `replay.review.updated` for subsequent release. Use committed `releasedAt` as `target.releaseId` and `occurredAt`. Recipient may be `{subject: verifiedSupabaseUUID}` or `{verifiedEmail: committedAudienceEmail}`; UUID fields must never contain legacy access IDs. Email matching avoids auth-user enumeration. Body contains no draft, note/review title, feedback text or arbitrary URL.

Server-only helper:

```js
import {sendEvent} from '@leewaypb/notifications/producer';
await sendEvent({
  serviceUrl:'https://leewaypb-library.leeohsunshine.chatgpt.site',
  secret:env.REPLAY_PRODUCER_SECRET,
  event:outboxEvent
});
```

The helper signs exact JSON bytes with HMAC-SHA256 over `<timestamp>\nPOST\n/v1/events\n<body>`. Re-sign retries with current timestamp, keep the event and ID stable. Service returns 200 `{accepted:true,duplicate:boolean}`; 409 indicates conflicting bytes under the same logical ID and needs owner attention. Retry 429/5xx/timeouts. Secret must be configured securely on both server environments with library owner; never put it in this prompt/source/client.

## Read status and deep links

Shared user API: GET `/v1/inbox?cursor=<opaque>` returns contract `leewaypb.notifications.inbox`, version 1, items/global authorized unreadCount/preferences; PUT `/v1/notifications/:encoded-id/read` accepts `{read,version}`; GET `/open` rechecks destination; preferences GET/PUT. Treat ID opaque; refresh on 409. Do not keep another authoritative read state in Replay.

Consume `/replay/view/:reviewId?release=<releasedAt>&at=<seconds>&entry=<UUID>&thread=<UUID>` only **after Replay’s normal independent access check**. If supplied release differs from current `releasedAt`, show that review changed and open current review without seeking a stale target. Verify entry/thread exists in the current visible discussion, and bound `at`. For current-review navigation, reuse the existing `playback`, `activeFocus`, and discussion controller: select the Questions tab, expand/focus the matching thread, and seek via the existing timestamp API. Opening/closing/polling inbox must not recreate video, reset its source, pause it, change orientation/layout width, clear a composed reply or toggle its playback mode. Different-review navigation may use the usual guarded route transition.

Current service access adapter reads existing `/api/replay/view/:id` and `/discussion` using the active access cookie at fixed Replay origin. Preserve their released-state, source, owner, email and audience checks. Destination app remains the final authority. Notify the shared owner if these routes change. Revocation and deletion are immediately enforced on next service read/open without relying on an event; keep released/draft data separate.

## Acceptance evidence

Two real approved test identities: coach and intended player; a third unrelated/denied identity. Questions and replies produce one notification after retry; first release/update produces correct generic event; draft changes produce zero. Crash between R2 commit and HTTP delivery recovers from outbox; losing HTTP acknowledgement stays deduped; altered payload under reused ID returns 409. Cross-app read state persists. Revoke/delete/reassign/change footage or hide thread and confirm no inbox metadata/count/open leak. Destination outage fails closed. Deep link opens the exact visible thread/timestamp without recreating a current video. Test YouTube/uploaded/local playback on mobile+desktop, keyboard, theme changes, route cleanup, and pending request during account switch. Report actual implementation separately from remaining activation prerequisites.
