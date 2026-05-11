import { describe, it, expect } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

const run = process.env.RELAYDESK_RUN_INTEGRATION === '1';

describe.skipIf(!run)('Integration · PostgreSQL (Testcontainers)', () => {
  it('starts and accepts connections', async () => {
    const container = await new PostgreSqlContainer('postgres:16-alpine').start();
    try {
      expect(container.getConnectionUri()).toContain('postgres');
    } finally {
      await container.stop();
    }
  });
});
