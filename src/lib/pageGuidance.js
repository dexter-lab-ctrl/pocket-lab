const GUIDANCE = {
  appstore: {
    simple: 'Install and manage the apps and services you use every day. Pocket Lab keeps the technical setup behind safe guided actions.',
    professional: 'Deploy approved app blueprints through FastAPI-owned typed operations. The frontend never runs shell commands.',
    enterprise: 'Install approved services with policy-aware execution, approval evidence, and auditable operation history.',
  },
  telemetry: {
    simple: 'See whether Pocket Lab and your monitoring tools are healthy enough to run actions safely.',
    professional: 'Review runtime health, telemetry, and observability signals without contacting infrastructure services directly from the frontend.',
    enterprise: 'Use system status as operational evidence for readiness, degraded mode, and runtime assurance reviews.',
  },
  security: {
    simple: 'Check whether your Pocket Lab environment needs safety attention before running changes.',
    professional: 'Review security posture and log-backed findings through FastAPI query endpoints.',
    enterprise: 'Use safety posture information to support governed approvals, policy decisions, and evidence capture.',
  },
  gitops: {
    simple: 'Keep your environment updated safely. Pocket Lab checks and queues updates instead of asking you to run commands.',
    professional: 'Launch named GitOps typed operations through FastAPI and workers. No shell editor is exposed in the UI.',
    enterprise: 'Run policy-aware GitOps workflows with approval gates, reasons, lifecycle events, and audit evidence.',
  },
  release: {
    simple: 'Check for updates and apply approved releases with a safer guided flow.',
    professional: 'Coordinate release sync, validation, and rollback using typed operations and event-sourced status.',
    enterprise: 'Review release readiness, approval state, and evidence before applying changes.',
  },
  drift: {
    simple: 'Find out whether something changed from what should be installed, then choose a safe next step.',
    professional: 'Detect, review, approve, and reconcile drift through worker-owned typed operations.',
    enterprise: 'Treat drift findings as governed change evidence with approval and audit records.',
  },
  blueprint: {
    simple: 'Understand what is installed and how the main parts of Pocket Lab fit together.',
    professional: 'Review the system map and blueprint relationships used by deployment and documentation flows.',
    enterprise: 'Use the architecture map as supporting evidence for change review and operational governance.',
  },
  fleet: {
    simple: 'Add and manage your devices without copying technical commands.',
    professional: 'Queue fleet join operations through FastAPI so workers own validation and execution.',
    enterprise: 'Govern device onboarding with role-aware approval, lifecycle events, and audit records.',
  },
  vault: {
    simple: 'Manage passwords and temporary access without exposing secrets in the interface.',
    professional: 'Rotate secrets and request dynamic credentials through typed operations and controlled API calls.',
    enterprise: 'Preserve secret-management evidence while keeping strict approval and audit boundaries.',
  },
  logs: {
    simple: 'Look at recent activity and troubleshooting hints in plain language.',
    professional: 'Query logs through FastAPI-owned endpoints, not direct Loki browser access.',
    enterprise: 'Use log queries as investigation evidence while preserving the control-plane boundary.',
  },
  opa: {
    simple: 'Check safety rules before important changes run.',
    professional: 'Review policy guardrails and OPA-backed decisions through the control API.',
    enterprise: 'Use policy results to support approvals, rejections, and compliance evidence.',
  },
  recovery: {
    simple: 'Create, check, and restore safe backups with clear guidance before risky steps.',
    professional: 'Run backup and restore typed operations with worker-owned execution and observable lifecycle events.',
    enterprise: 'Require evidence and approval before recovery actions that could affect data or service state.',
  },
  settings: {
    simple: 'Choose how Pocket Lab talks to you and how strict approvals should be.',
    professional: 'Configure experience language and governance mode without changing the runtime architecture.',
    enterprise: 'Switch strict approval behavior on intentionally and preserve audit evidence for governed runbooks.',
  },
};

export function guidanceFor(tabId, experienceMode = 'professional', governanceMode = 'personal') {
  const item = GUIDANCE[tabId] || GUIDANCE.appstore;
  if (governanceMode === 'enterprise') return item.enterprise || item.professional;
  if (experienceMode === 'simple') return item.simple || item.professional;
  return item.professional;
}

export function guidanceTitleFor(experienceMode = 'professional') {
  return experienceMode === 'simple' ? 'What can I do here?' : 'How this page works';
}
