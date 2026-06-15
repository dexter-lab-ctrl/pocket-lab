# Frontend and UI Quality Gates

## Purpose

The frontend quality gates ensure that the React/Vite PWA builds, renders, remains visually stable, and uses typed operation contracts instead of retired legacy payloads.

## Frontend architecture

```text
src/App.jsx
  -> ExperienceModeContext
  -> Professional tabs / SimpleDashboard
  -> typed operation client
  -> FastAPI REST + WebSocket
  -> LiveEventPanel, HealthEnginePanel, telemetry and release views
```

## Simple Experience Mode mapping

| Professional label | Simple label |
|---|---|
| GitOps | Keep My Environment Updated |
| Blueprint Catalog | Apps & Services |
| Drift Center | Health & Issues |
| Fleet Scaling | My Devices |
| Identity & Vault | Passwords & Access |
| Security Posture | Safety Center |
| NOC Telemetry | System Status |

Action labels:

| Professional action | Simple action |
|---|---|
| Deploy Blueprint | Install |
| Version | Release |
| Drift Detected | Something Changed |
| Join Fleet | Add Device |
| Desired State | What Should Be Installed |
| Rotate Secret | Change Password |

## Storybook gate

Run:

```bash
task test:storybook
```

A passing Storybook build confirms component stories compile under the same Vite/React toolchain. JSX-bearing Storybook preview files should use `.jsx` or `.tsx` extensions.

## Visual regression gate

Run:

```bash
npx playwright test tests/e2e/visual-regression.spec.ts --update-snapshots
task test:visual
```

The first command creates or updates the approved baseline. The second command verifies that current UI output matches the baseline.

Visual tests should be deterministic:

- mock backend REST calls
- freeze time where needed
- disable CSS animations for screenshots
- wait for real app-visible content, not just `body`
- avoid live polling or timestamp jitter during screenshots

## Network contract gate

Run:

```bash
task test:network
```

This confirms that frontend write flows submit typed operations and do not emit retired payloads such as `legacy_intent`, browser-facing `sync_bash`, browser-facing `tofu_deploy`, generic shell command bodies, or `/api/action/update`.

## Release quality meaning

Passing frontend, Storybook, network contract, and visual gates means the UI can be treated as a controlled operator surface. Future UI regressions should be caught as either build failures, contract failures, or screenshot diffs before release.
