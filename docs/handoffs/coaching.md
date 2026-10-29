# Copyable handoff — Leeway Coaching worker

Prepare Leeway Coaching to mount the shared LeewayPB Notifications island. Modify Coaching only when its owner authorizes implementation. Do not modify another app or shared Supabase settings/payments; do not add GitHub; do not send customer emails/push or enable paid features.

Shared project `appgprj_6ac7d23a57fc8191a106a2af53a10a20`; origin `https://leewaypb-library.leeohsunshine.chatgpt.site`; package `@leewaypb/notifications@0.1.0`, protocol v1. Installation and event contract are in the shared project's `docs/installation.md` and `docs/contract-v1.md`. The library/service and owner synthetic demo are implemented. **Coaching event production, identity bridge, authorization adapter and mounting are proposed only; the service currently rejects Coaching producer events.** Service remains owner-only.

Inspected baseline `25c1b31603c0e16999be8f6dd8e959ff5b4ae2da`: plain JS Worker, D1+R2, `worker/index.js`, `worker/breakdowns.js`, `worker/records.js`, `worker/setup.js`, `public` assets and `scripts/build.mjs`. Current code uses Sites owner identity and booking/breakdown capability tokens; there is no observed shared Supabase session to forward. Re-read current code. Do not claim Sites user IDs, booking tokens, submitted emails, or payment records are Supabase identities.

Mounting contract after an independently authorized identity/admission bridge exists:

```js
import {mountNotifications} from '/shared/notifications/0.1.0/island.js';
import {createTransport} from '/shared/notifications/0.1.0/transport.js';
const island = mountNotifications(document.getElementById('notifications'), {
  request:createTransport({baseUrl:'/api/notifications'}), appearance:'host'
});
// Destroy on account changes/teardown; do not interfere with checkout or booking controls.
```

Vendor pinned island/transport assets and include them in Coaching’s build. Map the container’s `--lr-*` styling tokens to the existing Leeway Red & Gold CSS variables locally; do not add global CSS. The host owns sign-in/admission. A proxy may forward only the current verified Supabase access token to the shared `/v1` user endpoints; enforce same-origin CSRF on PUT and keep token/capability/producer secrets out of the browser, URL, inbox, logs and notification targets.

The shared API returns one central inbox/read status: GET inbox/preferences/open, PUT read `{read:boolean,version:integer}` and preferences `{inApp:boolean,version:integer}`. Items carry opaque IDs and generic titles. Use no-store; refresh on 409; destination access remains independently enforced. The initial inbox can show Replay notifications to an authenticated user without granting access to Coaching records.

Coaching owns breakdown **delivery**, orders, bookings and schedule changes. Replay owns released reviews, questions and replies. Before enabling Coaching events, coordinate a versioned extension with the library owner: dedicated Coaching producer key, event catalog, minimum target IDs, recipient mapping, live Coaching access endpoint and fixed safe destinations. Do not force a Coaching delivery into a `replay.review.released` event. Consider duplicate user messaging when Coaching delivery and Replay release reference the same review; correlate their immutable source IDs and define whether distinct lifecycle notices should be shown. No cross-owner event reuse.

For future D1 operations, commit a schema-owned outbox row in the same atomic batch/transaction as the order/booking/delivery/schedule transition. Stable ID examples: `breakdown:<id>:delivered:<delivery_revision>`, `booking:<id>:confirmed:<revision>`, `booking:<id>:rescheduled:<revision>`; these are **proposals not accepted v1 event types**. Retries must preserve immutable events and never re-execute checkout/payment/calendar actions. Preserve manual outside-payment tracking and payment sandbox mode. No notification credentials are payment credentials.

Authorization endpoint must validate an actual Supabase subject, approved app admission and current record ownership/entitlement. Capability URLs cannot be published to inbox/push/email or treated as broad account grants. Void/delete/revoke/recipient changes must make inaccessible targets disappear from shared inbox/count/read/open checks. Do not merely trust an earlier `replay_verification` flag to grant current Replay access. Coordinate any identity/linking changes explicitly with owner first; shared-library scope does not authorize rewriting Coaching auth/payments.

Acceptance: signed-out and unauthorized record access; verified recipient mapping; no guest capability leakage; durable transactional outbox; duplicate retries; independent destination grant checks; read state shared with Replay; responsive/keyboard/style/teardown; unchanged checkout/payment/calendar behavior. Report each proposed prerequisite and implemented part separately.
