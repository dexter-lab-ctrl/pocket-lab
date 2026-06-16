# Simple Mode

Simple Mode makes Pocket Lab understandable for non-technical users without changing the backend execution model.

The same FastAPI, NATS / JetStream, worker, typed operation, event, and audit paths are used. Only language, layout, guidance, and progressive disclosure become friendlier.

## Label mapping

| Professional label | Simple Mode label |
| --- | --- |
| GitOps | Keep My Environment Updated |
| Blueprint Catalog | Apps & Services |
| Drift Center | Health & Issues |
| Fleet Scaling | My Devices |
| Identity & Vault | Passwords & Access |
| Security Posture | Safety Center |
| NOC Telemetry | System Status |

## Action mapping

| Professional action | Simple Mode action |
| --- | --- |
| Deploy Blueprint | Install |
| Version | Release |
| Drift Detected | Something Changed |
| Join Fleet | Add Device |
| Desired State | What Should Be Installed |
| Rotate Secret | Change Password |

## User experience rules

Simple Mode should:

- Explain what will happen before an action starts.
- Avoid exposing command syntax or shell-like wording.
- Show safety previews for risky actions.
- Show evidence receipts in friendly language.
- Use progressive disclosure for technical details.
- Keep degraded, offline, and blocked states understandable.

Simple Mode should not bypass approvals, workers, NATS / JetStream, typed operations, event logs, or audit evidence.
