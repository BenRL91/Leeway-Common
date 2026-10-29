# Install @leewaypb/notifications 0.1.0

## Distribution

Run `npm run pack:notifications` in the shared project. Install the resulting `leewaypb-notifications-0.1.0.tgz` with the host’s existing package manager, or copy `packages/notifications/island.js` and `transport.js` into a versioned host asset directory. Preserve filenames/imports. Pin 0.1.0 and commit the host lockfile when applicable. No npm registry or GitHub integration is required.

Plain JS example, using a **host-owned same-origin proxy** that validates the host session and app admission:

```js
import {mountNotifications} from '/shared/notifications/0.1.0/island.js';
import {createTransport} from '/shared/notifications/0.1.0/transport.js';
const request = createTransport({baseUrl:'/api/notifications'});
const island = mountNotifications(document.getElementById('notifications'), {
  request,
  appearance:'host',
  // Optional: consume an already-authorized same-app target without replacing playback.
  onNavigate: async notification => openAuthorizedNotificationTarget(notification)
});
// Call on sign-out/account changes; transport must now return the new account or 401.
await island.resetSession();
// Call on host route teardown.
island.destroy();
```

Without `onNavigate`, Open navigates to the rechecked destination. Do not pass `onNavigate` unless implemented; it must independently verify app access and handle stale targets.

React wrapper for PaddleLog:

```tsx
import {useEffect,useRef} from 'react';
import {mountNotifications} from '@leewaypb/notifications';
import {createTransport} from '@leewaypb/notifications/transport';
export function Notifications({accountKey}: {accountKey:string}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const island = mountNotifications(ref.current!, {
      request:createTransport({baseUrl:'/api/notifications'}), appearance:'host'
    });
    return () => island.destroy();
  },[accountKey]);
  return <div ref={ref}/>;
}
```

For Pickle Point’s bearer flow, `createTransport({baseUrl: serviceOrigin+'/v1', getAccessToken: () => currentFreshAccessToken()})` fetches a current token per request, stores nothing, and uses no cross-origin cookies. Prefer a same-origin proxy where app admission/offline handling requires it. On sign-out destroy/reset the island immediately. Never put a refresh token or producer key in its configuration.

## Proxy requirements

Preserve the host’s existing session refresh, admission and authorization. Obtain the current verified **Supabase access token internally**. Do not expose HttpOnly cookies to browser JS. Forward only allowlisted `/inbox`, `/preferences`, and `/notifications/:id/(open|read)` paths/methods to the fixed shared-service origin with `Authorization: Bearer <access token>`. Strip browser-supplied identity, producer, Cookie and dispatch headers. Apply the host’s same-origin CSRF guard for PUT. Bound bodies to 32 KiB; use 10-second timeout, manual redirects, no-store response, and no logs of credentials. The shared service independently validates Supabase and destination access; a proxy must not replace these checks with a claimed subject.

Replay’s `resolveAuth` can rotate access cookies. Its worker must expose the **current active token only to server code**, not reuse an expired original request cookie and not return the token from `/api/auth/session`. Merge refreshed session headers back into the proxy response. Existing beta rules remain the host’s responsibility.

## Shared service deployment

Existing project: `appgprj_6ac7d23a57fc8191a106a2af53a10a20`. Use Sites’ supported source/version/archive workflow. The shared project has a `DB` binding; schema changes are generated from `db/schema.ts` using `npm run db:generate`, reviewed, then deployed. No runtime DDL. Standard Sites storage is used; no paid project or delivery provider was provisioned.

Runtime values on the shared service:

- `SUPABASE_URL`: existing LeewayPB project URL; pinned issuer, no arbitrary providers.
- `SUPABASE_PUBLISHABLE_KEY`: existing public key, never a service/admin key.
- `DEMO_OWNER_EMAIL`: owner guard for synthetic demonstration.
- `REPLAY_PRODUCER_SECRET`: dedicated server-only random secret of at least 32 characters. **Securely provisioned in both server environments during activation coordination.** Coordinate securely with Replay’s worker, which needs the same dedicated key in its own server environment. Never include it in a chat handoff, source, browser bundle, or app’s public config.

The service `/v1` ingress is accessible without Sites gating; bearer/HMAC and current destination access are still mandatory. The demo remains owner protected. Do not bypass Sites gating, add a bypass token to browser code, or silently make the project public. Vendor the UI package into hosts so module loading does not depend on private demonstration assets.

## Smoke checks for every host

Signed-out view; approved/unapproved host user; bell count; unread filter; read/unread in two apps; reload persistence; preferences; offline/recovery; mobile viewport; keyboard dialog; appearance changes; route mount/destroy; account switch during a pending request; revoke review while inbox open; destination outage; stale release/thread. For Replay, also playback running before/during/after inbox open and mount/unmount, with actual YouTube and uploaded/local video on mobile and desktop.
