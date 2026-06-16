<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:deployment`. -->

# Pocket Lab Platform Guide

This generated page links the platform-specific deployment and development evidence that already exists in the repository.

## Platform source documents

| Document | Path | SHA-256 |
| --- | --- | --- |
| Android / Termux Operations Guide | docs/platform/android-termux-operations-guide.md | 69b8776365ae |
| Windows VS Code Development Configuration | docs/platform/windows-vscode-development.md | fbe30eee295a |
| Windows WSL2 Host Preflight | docs/platform/windows-wsl2-host-preflight.md | 9068cc29fd6f |
| Windows WSL2 Ubuntu Bootstrap | docs/platform/windows-wsl2-ubuntu-bootstrap.md | 9eadda51cd9c |
| Approvals Architecture | docs/architecture/approvals.md | 000e60ac3563 |
| Deployment / Runtime Blueprint | docs/architecture/deployment-runtime-blueprint.md | 7aae65ac91e4 |
| Production Architecture | docs/architecture/enterprise-architecture-blueprint.md | 2e1f885e4e0c |
| Architecture Overview | docs/architecture/index.md | 5365224a7492 |
| Runtime Flow | docs/architecture/runtime-flow.md | c2bc9f759bb6 |
| Structurizr Architecture | docs/architecture/structurizr-architecture.md | 94075480daea |
| Typed Operations Architecture | docs/architecture/typed-operations.md | 257bc3476883 |


## Android / Termux / ARM64 evidence

deployment evidence found 40 Android / Termux / ARM64-related evidence entries. Use the existing Android / Termux operations guide and smoke scripts where present; this generator only links and fingerprints existing sources.

## Ubuntu / WSL2 evidence

deployment evidence found 50 Ubuntu / WSL2-related evidence entries. Daily development and validation should run from the Linux filesystem repo, not from a Windows-mounted path.

## Governance wording

Deployment docs should preserve Personal, Professional, and Enterprise modes. Personal Mode may remain friendly and non-blocking, while Enterprise Mode remains opt-in and stricter for approval and audit workflows.
