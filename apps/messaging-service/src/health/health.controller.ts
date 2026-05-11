import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { prisma } from '@relaydesk/database';
import type { Redis } from '@relaydesk/redis';
import { REDIS } from '../infra/infra.module';

@Controller('health')
export class HealthController {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  @Get()
  summary() {
    return { status: 'ok', service: 'messaging-service' };
  }

  @Get('live')
  liveness() {
    return { ok: true, service: 'messaging-service', kind: 'liveness' };
  }

  @Get('ready')
  async readiness() {
    const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};
    const tRedis = Date.now();
    try {
      await this.redis.ping();
      checks.redis = { ok: true, latencyMs: Date.now() - tRedis };
    } catch (e) {
      checks.redis = {
        ok: false,
        error: e instanceof Error ? e.message : 'redis_error',
      };
    }
    const tDb = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { ok: true, latencyMs: Date.now() - tDb };
    } catch (e) {
      checks.database = {
        ok: false,
        error: e instanceof Error ? e.message : 'db_error',
      };
    }
    const ok = Object.values(checks).every((c) => c.ok);
    const body = {
      ok,
      service: 'messaging-service',
      kind: 'readiness',
      checks,
    };
    if (!ok) {
      throw new ServiceUnavailableException(body);
    }
    return body;
  }
}
