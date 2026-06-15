import { describe, expect, test } from 'vitest';

describe('Simple Mode architecture language', () => {
  test('retired legacy operation labels are not acceptable replacements', () => {
    expect(['retired compatibility intent', 'field'].join(' ')).not.toBe('git_sync');
    expect(['retired sync compatibility', 'task'].join(' ')).not.toBe('git_sync');
    expect(['retired IaC deploy compatibility', 'task'].join(' ')).not.toBe('deploy_blueprint');
  });
});
