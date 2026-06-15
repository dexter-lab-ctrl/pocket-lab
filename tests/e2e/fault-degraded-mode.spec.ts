import { test, expect } from '@playwright/test';


function unexpectedConsoleErrors(errors: string[]) {
  return errors.filter(error => {
    // In degraded-mode tests, 503 responses are expected because the control plane
    // must fail closed when NATS/worker/backend dependencies are unavailable.
    if (/Failed to load resource: the server responded with a status of 503/i.test(error)) {
      return false;
    }
    if (/Service Unavailable/i.test(error)) {
      return false;
    }
    return true;
  });
}

const forbiddenLegacyPatterns = [
  /legacy_intent/i,
  /sync_bash/i,
  /tofu_deploy/i,
  /\/api\/action\/update/i,
  /dashboard_api/i,
  /simulated production/i,
  /local fallback execution/i,
];

type Scenario = {
  ready: boolean;
  natsConnected: boolean;
  jetstream: boolean;
  workerAvailable: boolean;
  health: Record<string, unknown>;
  telemetry?: Record<string, unknown>;
  release?: Record<string, unknown>;
  failWrites?: boolean;
  failReason?: string;
};

function json(body: unknown, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  };
}

const healthyServices = {
  fastapi: { status: 'healthy', message: 'API ready' },
  nats: { status: 'healthy', message: 'NATS connected' },
  worker: { status: 'healthy', message: 'Worker online' },
  vault: { status: 'healthy', message: 'Vault unsealed' },
  gatus: { status: 'healthy', message: 'Health checks green' },
};

const healthyScenario: Scenario = {
  ready: true,
  natsConnected: true,
  jetstream: true,
  workerAvailable: true,
  health: {
    status: 'healthy',
    overall: 'healthy',
    source: 'gatus',
    summary: { healthy: 5, warning: 0, degraded: 0, unhealthy: 0, unavailable: 0, maintenance: 0, unknown: 0, total: 5 },
    services: healthyServices,
  },
};

const defaultTelemetry = {
  cpu_usage_percent: 18.5,
  memory_usage_mb: 742,
  free_space_mb: 22142,
  cpu_temp_c: 39.2,
};

const defaultRelease = {
  status: 'running',
  current_version: 'dev',
  update_available: false,
  stages: [
    { name: 'check', status: 'complete' },
    { name: 'package', status: 'complete' },
    { name: 'publish', status: 'pending' },
  ],
  timeline: [
    { step: 'check', status: 'complete' },
    { step: 'package', status: 'complete' },
    { step: 'publish', status: 'pending' },
  ],
};

async function installScenarioRoutes(page, scenario: Scenario, operationRequests: Array<{ url: string; body: string; status: number }>) {
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === '/ready') {
      await route.fulfill(json({
        status: scenario.ready ? 'ready' : 'degraded',
        ready: scenario.ready,
        health_engine: scenario.health.status ?? scenario.health.overall ?? 'unknown',
        nats: { connected: scenario.natsConnected, jetstream_enabled: scenario.jetstream, required: true },
        worker: { available: scenario.workerAvailable },
      }, scenario.ready ? 200 : 503));
      return;
    }

    if (path === '/api/nats/status') {
      await route.fulfill(json({
        mode: 'nats',
        connected: scenario.natsConnected,
        jetstream_enabled: scenario.jetstream,
        jetstream: scenario.jetstream,
        required: true,
        fallback_reason: scenario.natsConnected ? '' : 'fault: nats unavailable',
      }));
      return;
    }

    if (path === '/api/workers/status') {
      await route.fulfill(json({
        available: scenario.workerAvailable,
        running: scenario.workerAvailable,
        workers_seen: scenario.workerAvailable ? 1 : 0,
        workers: [{ name: 'pocketlab_worker', status: scenario.workerAvailable ? 'online' : 'offline' }],
      }));
      return;
    }

    if (path === '/api/health-engine.json') {
      await route.fulfill(json(scenario.health));
      return;
    }

    if (path === '/api/telemetry.json') {
      await route.fulfill(json(scenario.telemetry ?? defaultTelemetry));
      return;
    }

    if (path === '/api/catalog.json') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'gitea',
            name: 'Gitea',
            title: 'Gitea',
            description: 'Self-hosted Git service',
            category: 'DevOps',
            status: 'available',
            operation: 'deploy_blueprint',
            blueprint: 'gitea',
          },
          {
            id: 'vault',
            name: 'Vault',
            title: 'Vault',
            description: 'Secrets and access management',
            category: 'Security',
            status: 'degraded',
            operation: 'deploy_blueprint',
            blueprint: 'vault',
          },
        ]),
      });
      return;
    }

    if (path === '/api/fleet.json' || path === '/api/fleet/agents') {
      await route.fulfill(json({
        agents: [
          { node_id: 'android-lab-01', hostname: 'android-lab-01', status: 'online', role: 'compute' },
          { node_id: 'edge-lab-02', hostname: 'edge-lab-02', status: 'offline', role: 'storage', last_seen: '2026-06-01T10:00:00Z' },
        ],
      }));
      return;
    }

    if (path.startsWith('/api/fleet/agents/') && path.endsWith('/commands')) {
      await route.fulfill(json({ commands: [] }));
      return;
    }

    if (path === '/api/drift/summary') {
      await route.fulfill(json({ status: 'degraded', items: [{ id: 'vault-policy', status: 'drift_detected', severity: 'medium' }] }));
      return;
    }

    if (path === '/api/drift/jobs') {
      await route.fulfill(json({ jobs: [{ job_id: 'drift-fault-1', status: 'failed', reason: 'control-plane-degraded' }] }));
      return;
    }

    if (path === '/api/operations/runs') {
      await route.fulfill(json({ runs: [{ job_id: 'fault-run-1', operation: 'git_sync', status: 'queued' }] }));
      return;
    }

    if (path === '/api/release/workflow' || path === '/api/release/self-update/status') {
      await route.fulfill(json(scenario.release ?? defaultRelease));
      return;
    }

    if (path === '/api/events/recent') {
      await route.fulfill(json({
        events: [
          { subject: 'pocketlab.events.health.checked', type: 'health.degraded', payload: { status: scenario.health.status ?? scenario.health.overall } },
        ],
      }));
      return;
    }

    if (path === '/api/events/status') {
      await route.fulfill(json({ status: 'degraded', transport: 'polling', recent: 1 }));
      return;
    }

    if (path === '/api/workflows/status') {
      await route.fulfill(json({ status: 'ok', workflows: 1 }));
      return;
    }

    if (path === '/api/reliability/status') {
      await route.fulfill(json({ status: 'ok', dlq: 0, retries: 0 }));
      return;
    }

    if (path === '/api/opa_evaluations.json') {
      await route.fulfill(json({ status: 'degraded', evaluations: [{ id: 'deny-unsafe-local-fallback', result: 'deny' }] }));
      return;
    }

    if (path === '/api/pipeline_status.json') {
      await route.fulfill(json({ status: 'degraded', reason: 'control-plane fault scenario' }));
      return;
    }

    if (path === '/api/catalog/refresh' || path === '/api/operations/execute' || path === '/api/operations/preview') {
      const body = request.postData() ?? '';
      const status = scenario.failWrites ? 503 : 202;
      operationRequests.push({ url: request.url(), body, status });
      if (scenario.failWrites) {
        await route.fulfill(json({
          detail: scenario.failReason ?? 'NATS/JetStream worker execution is required; write action failed closed.',
          execution_mode: 'unavailable',
          accepted: false,
        }, 503));
      } else {
        await route.fulfill(json({
          accepted: true,
          status: 'queued',
          job_id: 'fault-gate-job-1',
          command_subject: 'pocketlab.commands.operation.execute',
          execution_mode: 'worker',
        }, 202));
      }
      return;
    }

    if (path.startsWith('/api/')) {
      await route.fulfill(json({ status: 'ok' }));
      return;
    }

    if (path.startsWith('/loki/')) {
      await route.fulfill(json({ status: 'success', data: { result: [] } }));
      return;
    }

    await route.fallback();
  });
}

function assertNoLegacyExposure(text: string, requests: Array<{ url: string; body: string }>) {
  for (const pattern of forbiddenLegacyPatterns) {
    expect(text).not.toMatch(pattern);
    for (const request of requests) {
      expect(request.url).not.toMatch(pattern);
      expect(request.body).not.toMatch(pattern);
    }
  }
}

async function collectPage(page, scenario: Scenario) {
  const failedRequests: string[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const operationRequests: Array<{ url: string; body: string; status: number }> = [];

  page.on('requestfailed', request => {
    const url = request.url();
    if (!url.includes('/ws/events')) {
      failedRequests.push(`${request.method()} ${url} ${request.failure()?.errorText ?? ''}`);
    }
  });

  page.on('console', message => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  await installScenarioRoutes(page, scenario, operationRequests);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await page.waitForTimeout(500);

  await page.waitForFunction(() => {
    const rootText = document.querySelector('#root')?.textContent || '';
    const bodyText = document.body?.innerText || document.body?.textContent || '';
    return (rootText + bodyText).trim().length > 0;
  }, null, { timeout: 15000 }).catch(() => undefined);

  const text = ((await page.locator('body').textContent()) || '').trim();
  const rootHtml = await page.locator('#root').evaluate(el => el.innerHTML).catch(() => '');
  const title = await page.title().catch(() => '');

  return {
    failedRequests,
    consoleErrors,
    pageErrors,
    operationRequests,
    text,
    rootHtmlLength: rootHtml.length,
    title,
  };
}

test('NATS-down scenario fails closed and shows degraded control plane', async ({ page }) => {
  const scenario: Scenario = {
    ...healthyScenario,
    ready: false,
    natsConnected: false,
    jetstream: false,
    failWrites: true,
    failReason: 'NATS/JetStream worker execution is required; local execution is disabled.',
    health: {
      status: 'degraded',
      overall: 'degraded',
      source: 'fault-injection',
      summary: { healthy: 3, warning: 0, degraded: 2, unhealthy: 0, unavailable: 1, maintenance: 0, unknown: 0, total: 6 },
      services: { ...healthyServices, nats: { status: 'unavailable', message: 'NATS unavailable' } },
    },
  };

  const result = await collectPage(page, scenario);
  expect(result.text).toMatch(/NATS|degraded|unavailable|offline|not ready|control plane/i);

  const writeResult = await page.evaluate(async () => {
    const response = await fetch('/api/operations/execute', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ operation: 'git_sync', target: { kind: 'gitops_repo', ref: 'pocket_lab_iac' }, params: { source: 'fault-gate' } }),
    });
    return { status: response.status, body: await response.text() };
  });

  expect(writeResult.status).toBe(503);
  expect(writeResult.body).toMatch(/NATS|JetStream|worker|required|disabled/i);
  expect(writeResult.body).not.toMatch(/legacy_intent|sync_bash|tofu_deploy|\/api\/action\/update/i);
  expect(result.failedRequests).toEqual([]);
  expect(unexpectedConsoleErrors(result.consoleErrors)).toEqual([]);
  assertNoLegacyExposure(result.text, result.operationRequests);
});

test('worker-down scenario fails writes without claiming local fallback', async ({ page }) => {
  const scenario: Scenario = {
    ...healthyScenario,
    ready: false,
    workerAvailable: false,
    failWrites: true,
    failReason: 'Pocket Lab worker is unavailable; NATS/JetStream worker execution is required.',
    health: {
      status: 'degraded',
      overall: 'degraded',
      source: 'fault-injection',
      summary: { healthy: 4, warning: 0, degraded: 1, unhealthy: 0, unavailable: 1, maintenance: 0, unknown: 0, total: 6 },
      services: { ...healthyServices, worker: { status: 'unavailable', message: 'Worker offline' } },
    },
  };

  const result = await collectPage(page, scenario);
  expect(result.text).toMatch(/worker|degraded|unavailable|offline|not ready|control plane/i);

  const writeResult = await page.evaluate(async () => {
    const response = await fetch('/api/catalog/refresh', { method: 'POST', headers: { accept: 'application/json' } });
    return { status: response.status, body: await response.text() };
  });

  expect(writeResult.status).toBe(503);
  expect(writeResult.body).toMatch(/worker|NATS|JetStream|required|unavailable/i);
  expect(writeResult.body).not.toMatch(/legacy_intent|sync_bash|tofu_deploy|\/api\/action\/update|local fallback execution/i);
  expect(result.failedRequests).toEqual([]);
  expect(unexpectedConsoleErrors(result.consoleErrors)).toEqual([]);
  assertNoLegacyExposure(result.text, result.operationRequests);
});

test('vault-sealed and bad-health scenario renders degraded state without React crash', async ({ page }) => {
  const scenario: Scenario = {
    ...healthyScenario,
    ready: true,
    health: {
      status: 'degraded',
      overall: 'degraded',
      source: 'gatus',
      summary: { healthy: 4, warning: 0, degraded: 1, unhealthy: 0, unavailable: 0, maintenance: 0, unknown: 0, total: 5 },
      services: { ...healthyServices, vault: { status: 'sealed', message: 'Vault sealed' } },
    },
  };

  const result = await collectPage(page, scenario);
  expect(result.pageErrors, `page errors: ${result.pageErrors.join('\n')}`).toEqual([]);
  expect(result.rootHtmlLength, `blank root; title=${result.title}; console=${result.consoleErrors.join('\n')}`).toBeGreaterThan(0);
  expect(result.text).toMatch(/Vault|sealed|degraded|Health|System Status|Password|Access/i);
  expect(result.failedRequests).toEqual([]);
  expect(unexpectedConsoleErrors(result.consoleErrors)).toEqual([]);
  assertNoLegacyExposure(result.text, result.operationRequests);
});

test('low-disk telemetry, stale fleet agent, drift, and release failure render safely', async ({ page }) => {
  const scenario: Scenario = {
    ...healthyScenario,
    telemetry: { cpu_usage_percent: 91.5, memory_usage_mb: 3800, free_space_mb: 512, cpu_temp_c: 74.2 },
    release: {
      ...defaultRelease,
      status: 'failed',
      reason: 'release artifact verification failed',
      stages: [{ name: 'verify', status: 'failed' }],
      timeline: [{ step: 'verify', status: 'failed' }],
    },
    health: {
      status: 'degraded',
      overall: 'degraded',
      source: 'gatus',
      summary: { healthy: 3, warning: 1, degraded: 1, unhealthy: 0, unavailable: 0, maintenance: 0, unknown: 0, total: 5 },
      services: healthyServices,
    },
  };

  const result = await collectPage(page, scenario);
  expect(result.pageErrors, `page errors: ${result.pageErrors.join('\n')}`).toEqual([]);
  expect(result.rootHtmlLength, `blank root; title=${result.title}; console=${result.consoleErrors.join('\n')}`).toBeGreaterThan(0);
  expect(result.text).toMatch(/Telemetry|System Status|CPU|Memory|Disk|Fleet|Device|Release|Drift|Security|Posture/i);
  expect(result.failedRequests).toEqual([]);
  expect(unexpectedConsoleErrors(result.consoleErrors)).toEqual([]);
  assertNoLegacyExposure(result.text, result.operationRequests);
});
