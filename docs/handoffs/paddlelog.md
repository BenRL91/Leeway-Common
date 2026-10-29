# Copyable handoff — PaddleLog worker

Prepare PaddleLog to mount the shared LeewayPB Notifications island. Do not implement until authorized in PaddleLog’s own worker. Modify PaddleLog only; no other app/shared-auth/payment changes, GitHub integration, customer email/push or paid provisioning.

Shared project `appgprj_6ac7d23a57fc8191a106a2af53a10a20`; origin `https://leewaypb-library.leeohsunshine.chatgpt.site`; pinned package `@leewaypb/notifications@0.1.0`, inbox/event protocol 1. Shared island/service/demo implemented; **PaddleLog mounting/proxy/events are handoff only**. The service currently accepts Replay producer types only and is owner-only. Coordinate service reachability with its owner before live use.

Inspected baseline `1a7aa7c2c6722b9037471bc591612de129e03c88`: React/Vinext, D1+R2; `lib/server/web-session.ts`, auth/session routes, `public/appearance.js`, `public/ui-system.css`, native bearer flows. Re-read current source before edits; keep Supabase subject distinct from PaddleLog’s mapped app account ID.

```tsx
import {useEffect,useRef} from 'react';
import {mountNotifications} from '@leewaypb/notifications';
import {createTransport} from '@leewaypb/notifications/transport';
export function NotificationBell({accountKey}:{accountKey:string}) {
  const mount=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const island=mountNotifications(mount.current!,{
      request:createTransport({baseUrl:'/api/notifications'}),appearance:'host'
    });
    return ()=>island.destroy();
  },[accountKey]);
  return <div ref={mount} className="paddlelog-notifications"/>;
}
```

Install the delivered 0.1.0 tarball using the existing package manager and pin the lockfile. Mount in a stable authenticated header. StrictMode teardown/remount must be safe. Keep notification state out of paddle/session exports and application library JSON.

Container-only theme mapping:

```css
.paddlelog-notifications {
 --lr-card:var(--card); --lr-text:var(--text); --lr-secondary-text:var(--secondary);
 --lr-strong-border:var(--line-strong); --lr-red:var(--accent);
 --lr-gold-text:var(--brand-ink); --lr-on-accent:var(--accent-text,#fff);
}
```

Island reads existing root `data-appearance`; do not overwrite `paddlelog.appearance.v1`, accent selection or image/icon appearance handlers.

Implement a same-origin notifications proxy using PaddleLog’s existing admitted web account/session code. Preserve HttpOnly cookies and token refresh; forward the **current verified Supabase access token**, not mapped account ID or Sites headers, to fixed shared `/v1` user routes. Only inbox/preferences/open/read methods are allowed; existing same-origin mutation guard, timeout/no redirects/no-store, no logs of tokens. Native can supply its existing fresh bearer token with unchanged admission checks. Account changes must immediately tear down/reset the old inbox and cancel pending requests.

Shared contract: GET `/v1/inbox?cursor=<opaque>` -> `{contract:'leewaypb.notifications.inbox',version:1,items,unreadCount,nextCursor,preferences}`. PUT `/v1/notifications/:encoded-id/read` `{read,version}`; GET `/open` -> fresh `{destination,target}`; preferences GET/PUT `{inApp,version}`. State is central per Supabase subject; never store a competing read status in PaddleLog. 401 means sign in; 404 unavailable/not-owned; 409 refresh; 503 hide stale notification metadata and allow retry.

PaddleLog event integrations are intentionally **undefined until a concrete need arises**. Do not invent maintenance reminders, collection social events, subscription notices or payments. Ask shared-library owner to add an explicit versioned catalog, producer credential, PaddleLog access adapter and durable outbox when needed. Shared identity grants no paddle/session access to Replay or another app.

Acceptance: Web/native approved user and beta-denied user; mapped identity correctness; central Replay read state; light/dark/system and selected accent; React StrictMode cleanup; offline library remains usable; account switch while request pending; no regression to paddles/sessions/subscriptions/export; mobile bell placement and accessible dialog.
