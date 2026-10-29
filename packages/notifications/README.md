# @leewaypb/notifications 0.1.0

Framework-independent notification island. No runtime dependencies. Browser entry `mountNotifications(container,{request,appearance,onNavigate?})`; transport entry `createTransport({baseUrl,getAccessToken?})`; **server-only** producer entry `sendEvent({serviceUrl,secret,event})`.

Host owns auth, admission, asset bundling and navigation. Service owns durable inbox, preferences, read status and access enforcement. Call `destroy()` on teardown/account change; `resetSession()` clears old UI and aborts requests if transport identity changes. Shadow DOM styles consume optional `--lr-card`, `--lr-text`, `--lr-secondary-text`, `--lr-strong-border`, `--lr-red`, `--lr-gold-text`, `--lr-on-accent`. Defaults match Leeway Red & Gold. Observe host `data-appearance` or choose `host|system|dark|light`.

Requires native Shadow DOM, dialog, MutationObserver, AbortController, fetch; modern Safari/Chrome/Firefox. UI never reads/persists auth tokens, modifies host storage/styles or calls video APIs. Poll default 30 seconds, minimum 15 seconds. Emails/push unavailable. Session reset must accompany host account changes; this package does not own sign-in events.

See shared project's installation and contract documents. Vendor the pinned package or install its local tarball; no registry or GitHub integration required.
