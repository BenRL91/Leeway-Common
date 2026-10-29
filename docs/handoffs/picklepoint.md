# Copyable handoff — Pickle Point worker

Prepare Pickle Point to mount the shared LeewayPB Notifications island when authorized in its worker. Modify Pickle Point only. Do not change PaddleLog’s beta roster or shared Supabase settings/payments, add GitHub, send customer emails/push or enable paid services.

Shared project `appgprj_6ac7d23a57fc8191a106a2af53a10a20`; origin `https://leewaypb-library.leeohsunshine.chatgpt.site`; package `@leewaypb/notifications@0.1.0`, inbox/event protocol 1. Shared module/service/demo implemented; **Pickle Point mounting/proxy/events are proposed handoff only**. No Pickle Point event types/producer are enabled. Service remains owner-only; coordinate allowed reachability with shared owner before activation.

Inspected baseline `1792eb5f501a88316c067bb46b1233709ec5e101`: plain ES modules + Worker/D1; `web/leeway-auth.js`, `server/library.js`, `server/beta.js`, `dist/appearance.js`, `dist/appearance.css`, `scripts/build.mjs`, existing offline shell/service worker. Re-read current code. Preserve single SDK client, token refresh/cross-tab locks, `tokenFor(expectedSubject)`, and PaddleLog beta-admission authority.

Vendor pinned `island.js` / `transport.js` as build assets, then use existing auth object, never another auth client:

```js
import {mountNotifications} from '/shared/notifications/0.1.0/island.js';
import {createTransport} from '/shared/notifications/0.1.0/transport.js';
const expectedSubject=await auth.identity();
const request=createTransport({
 baseUrl:'/api/notifications',
 getAccessToken:()=>auth.tokenFor(expectedSubject)
});
const island=mountNotifications(document.getElementById('notifications'),{
 request,appearance:'host'
});
// auth.subscribe: destroy immediately on sign-out/account mismatch; recreate only after admission.
// Route teardown: island.destroy(); do not tear down live scoring or its persistence.
```

Implement `/api/notifications/*` as same-origin bearer proxy. Independently validate Supabase and keep `checkBeta` admission authority. Only allow shared inbox/preferences/open/read routes/methods, forward active bearer to fixed shared `/v1`, use timeout/manual redirects/no-store, bound JSON, and do not forward producer/identity/dispatch/cookie headers. Never store tokens or read state in scoring library/session outbox/export. Direct service bearer transport is an alternative only once service reachability/CORS and equivalent host admission are verified.

Container-only appearance mapping:

```css
#notifications {
 --lr-card:var(--card); --lr-text:var(--text); --lr-secondary-text:var(--secondary);
 --lr-strong-border:var(--strong-line); --lr-red:var(--accent);
 --lr-gold-text:var(--accent-ink); --lr-on-accent:var(--accent-text,#fff);
}
```

Observe current `data-appearance` and inherited variables. Preserve the stored `picklepoint.appearance.v1` preference and selectable accent themes. Do not change the scoring court’s colors/controls/layout to fit the island.

User protocol: GET `/v1/inbox?cursor=<opaque>` -> contract `leewaypb.notifications.inbox`, version 1, accessible items/global unreadCount/preferences; PUT `/v1/notifications/:encoded-id/read` `{read,version}`; GET `/open` -> currently authorized `{destination,target}`; preferences GET/PUT `{inApp,version}`. Read state is central per Supabase subject across apps. Refresh after 409. Never infer permission to a review/paddle/session from a matching email or token alone.

Keep notification API responses out of service-worker/offline caches. Do not queue notification writes with score-session delivery. Offline notifications may be unavailable while scoring, Undo, crash recovery, session/paddle sync and the live host remain fully usable. No notification polling or teardown may alter an active game or service worker.

No new Pickle Point event catalog until a concrete need arises. In particular, do not add unsolicited opponent invitations, reminders, match results or cross-app lifecycle events. Future events require versioned contract, dedicated producer key, current-access endpoint and transactional outbox coordinated with library owner. Shared auth alone grants no access to either app’s data.

Acceptance: beta denied user stays denied; bearer token freshness and account mismatch stop old requests; no second auth client; read state matches Replay; PWA offline scoring still works; notification APIs never cached; selectable appearances, keyboard/mobile; lifecycle cleanup; no duplicate paddle/session deliveries or changed scoring behavior.
