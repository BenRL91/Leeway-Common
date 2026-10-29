# Leeway Common

**Shared notification infrastructure for independently released LeewayPB apps.**

Leeway Common packages a framework-independent notification inbox with a dedicated service for events, preferences and read state. It gives host applications a consistent notification interface while leaving destination authorization with the application that owns the underlying content.

[Architecture](docs/architecture.md) · [Installation](docs/installation.md) · [Contract v1](docs/contract-v1.md) · [Verification](docs/verification.md)

## What is included

- Shadow DOM notification island with a bell, inbox, read/unread state and preferences.
- Browser transport and a server-only event producer helper.
- A Worker service backed by D1 for notification persistence.
- Identity validation and per-destination authorization.
- An owner-protected demonstration using synthetic fixtures.

## Engineering highlights

| Concern | Approach |
| --- | --- |
| Host compatibility | Framework-independent UI with Shadow DOM style isolation |
| Data ownership | Dedicated notification schema; no direct writes into another app's data |
| Authorization | Identity validation plus destination-specific access checks |
| Integration contracts | Versioned event/transport boundaries and explicit worker handoffs |
| Safe delivery scope | In-app notifications implemented; email and push remain disabled |
| Verification | Service, Worker and UI-island tests with controlled fixtures |

## Development

```sh
npm ci
npm test
npm run build
npm run pack:notifications
```

The package is `@leewaypb/notifications@0.1.0`. The build produces a Worker application; Drizzle owns schema migrations. See [installation](docs/installation.md) for configuration and host mounting instructions.

| Path | Contents |
| --- | --- |
| [packages/notifications/](packages/notifications/) | UI island, transport, producer and type declarations |
| [service/](service/) | Event ingestion, authorization and persistence |
| [db/](db/), [drizzle/](drizzle/) | Owned schema and migrations |
| [demo/](demo/) | Synthetic demonstration and playback fixture |
| [tests/](tests/) | Automated tests |
| [docs/handoffs/](docs/handoffs/) | Application-specific integration contracts |

## Integration status

A package, a service and a host integration have separate release states. The Common repository documents Replay's adapter and activation handoff; verify current host activation in the consuming app. Coaching, PaddleLog and Pickle Point handoff documents describe integration work, not proof of deployed integrations.

[Open the demonstration](https://leewaypb-library.leeohsunshine.chatgpt.site) — owner-protected, with synthetic data. Its two panels are fixtures, not two production applications.

See [Replay activation readiness](docs/replay-activation-readiness.md), [verification limits](docs/verification.md) and the [delivery roadmap](docs/delivery-roadmap.md). Email and push delivery are disabled. No registry publication or third-party delivery provider is implied.

## Related projects

| Project | Responsibility |
| --- | --- |
| [PaddleLog](https://github.com/BenRL91/PaddleLog) | Equipment, maintenance and usage history |
| [Pickle Point](https://github.com/BenRL91/Pickle-Point) | Scoring, games and sessions |
| [Leeway Coaching](https://github.com/BenRL91/Leeway-Coaching) | Booking and breakdown fulfillment |
| [Leeway Replay](https://github.com/BenRL91/Leeway-Replay) | Private video reviews and discussion |
| [Leeway Common](https://github.com/BenRL91/Leeway-Common) | Shared notification components and service |

Each repository has its own release lifecycle. Shared identity does not grant access to another app's private data.
