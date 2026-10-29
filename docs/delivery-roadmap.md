# Email and push path — proposed only

Current UI exposes persistent in-app preferences and clearly unavailable email/push channels. There is no sender, push subscription, service worker, delivery job, or auto-schedule in this release. No customer email/push is sent, and no billable feature is enabled.

When requested, first add versioned per-app/event/channel preferences, explicit opt-in, and unsubscribe controls. Review in-app/event preferences separately from transactional delivery obligations. Recipient identity is not marketing consent.

Add notification-owned delivery jobs keyed by `event + recipient + channel`, with durable retries and no duplicate sends. Before a job renders or sends, ask the destination app for current access and recheck release generation; canceled/revoked targets must suppress delivery. Use minimal generic text and require authenticated destination access. Never include private feedback/body in push lock-screen text by default.

Email requires an approved sender/provider, domain setup, suppression/unsubscribe behavior, and sandbox test delivery before customer activation. Obtain approval for provider fees and customer sends.

Push requires HTTPS service reachability, VAPID for web or platform registration for native, permission requested from a user gesture, account-scoped subscription lifecycle, sign-out/unlink cleanup, and unsubscribe controls. Coordinate host-specific PWA/Capacitor/APNs/FCM support with the relevant worker; do not replace an app’s existing service worker. Obtain approval before enabling paid capabilities or real user delivery.
