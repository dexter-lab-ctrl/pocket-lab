# Edge Performance Guide

## Purpose

Pocket Lab is designed for edge environments. The goal is predictable responsiveness on constrained hardware, not massive centralized throughput.

## Performance Philosophy

Pocket Lab should be:

- Fast to start.
- Lightweight in memory.
- Responsive in the UI.
- Resilient under degraded runtime conditions.
- Safe on small ARM/Termux-style systems.

## Performance Smoke Gate

```bash
task test:performance
```

This gate validates lightweight performance assumptions such as FastAPI import/startup time, workflow journal rebuild time, state helper performance, and basic runtime sanity.

It is not a heavy load test.

## Recommended Edge Budgets

| Area | Suggested Budget |
|---|---|
| FastAPI import/startup smoke | Less than a few seconds. |
| Workflow journal rebuild smoke | Sub-second for normal edge state. |
| Typed operation accept | Fast local acknowledgement, typically under 500 ms. |
| UI tab switch | Should feel immediate. |
| Catalog render | Should handle 50–100 entries. |
| Event replay | Should load recent events without UI freeze. |

## What Pocket Lab Does Not Need Yet

Pocket Lab does not currently need 1000-user load testing, large-cluster throughput testing, high-volume NATS stress tests on every commit, or long soak tests on every push.

## Future Checks

Recommended future checks:

- App Catalog render with 100 entries.
- Event panel render with 250 events.
- Fleet view with 25–50 agents.
- Release timeline render with many stages.
- Worker command accept latency.
- WebSocket fallback response time.
- Memory sanity on Android/Termux.

## Troubleshooting

| Symptom | Likely Cause |
|---|---|
| Slow startup | Heavy import or blocking initialization. |
| Slow journal rebuild | Event log too large or inefficient replay. |
| UI freeze | Large unvirtualized list or malformed payload. |
| Slow operation accept | NATS, API, or worker readiness issue. |
| Slow catalog | Large catalog or expensive normalization. |

## Maintenance Rule

Keep performance checks fast enough for CI. Run deeper edge benchmarks before major releases or platform changes.
