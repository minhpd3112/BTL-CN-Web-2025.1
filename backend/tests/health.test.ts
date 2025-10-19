import { describe, expect, test } from 'vitest';

import { getHealthStatus } from '../src/services/health.service';

describe('health service', () => {
  test('returns ok status', () => {
    const result = getHealthStatus();
    expect(result.status).toBe('ok');
  });
});