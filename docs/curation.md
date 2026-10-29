# Curating the LeewayPB Library

The library owns Notifications and its supporting service only. Add another module when an app worker brings a concrete repeated use case; do not add a common router, authentication wrapper, state framework, payment library, app-data bridge, or unrelated UI collection in anticipation.

Every accepted module needs: owner and purpose; package version; explicit input/output contract; required host adapters and permissions; reversible mount/destroy; isolated styles; documented appearance tokens; mobile/accessibility checks; error/offline states; tests proportionate to risk; host-specific handoffs and implementation status. Preserve each app’s independent build/deploy and rollback.

Release artifacts are immutable and pinned. Additive contract v1 changes must remain compatible with existing v1 consumers; breaking event or API changes require contract v2 and parallel compatibility support, not an in-place rewrite. Package 0.x breaking changes bump its minor version; post-1.0 use semver. Update changelog, package declarations and docs together.

No credentials in packages. Modules delegate auth/session renewal to hosts; services independently validate identity and application access. No shared DB access merely because apps share Supabase identity.

Current registry: `notifications` 0.1.0, event/inbox contract 1, shared-library owner. Services: notification ingestion/inbox/read-state/preferences + Replay access adapter. First host: Replay, handoff prepared. Other hosts: handoffs only.
