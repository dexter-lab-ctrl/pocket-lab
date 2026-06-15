# Tier 9B UI Evidence

This page is generated from Tier 9A Storybook screenshot evidence and validation command metadata.

## Evidence summary

| Field | Value |
| --- | --- |
| Tier | Tier 9B — UI Evidence Freshness, Visual, Accessibility, and Release Evidence |
| Screens | 11 |
| Story exports | 29 |
| Screenshots | 29 |
| MkDocs image links | 29 |
| Source fingerprint | 1db7d408c9e396f6 |

## Evidence areas

| Area | Status | Evidence |
| --- | --- | --- |
| freshness | tracked | freshness checks encoded in manifest |
| visual | tracked | playwright-visual=0, visual=missing, test-visual=missing |
| accessibility | tracked | playwright-a11y=0, a11y=missing, test-a11y=missing |
| release | tracked | release-dry-run=0, npm-build=missing, storybook-build=missing, mkdocs-build=missing |

## Validation commands

```bash
task docs:ui:screenshots
task docs:ui:evidence
task docs:ui:evidence:check
task test:visual
task test:a11y
mkdocs build --strict
```
