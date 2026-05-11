import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@relaydesk/database';
import type { Redis } from '@relaydesk/redis';
import type { RelayDeskEnv } from '@relaydesk/config';
import { simRedisDown } from '@relaydesk/common';
import { REDIS } from '../infra/infra.module';
import { snapshotRabbitMqQueues } from '../infra/rabbitmq-queues';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {}

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
    const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string; skipped?: boolean }> = {};
    const tRedis = Date.now();
    try {
      if (simRedisDown()) {
        checks.redis = { ok: false, error: 'simulated_redis_down' };
      } else {
        await this.redis.ping();
        checks.redis = { ok: true, latencyMs: Date.now() - tRedis };
      }
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

    const tRmq = Date.now();
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    const rmq = await snapshotRabbitMqQueues(env);
    if (rmq.skipped) {
      checks.rabbitmq = { ok: true, skipped: true };
    } else {
      checks.rabbitmq = {
        ok: rmq.ok,
        latencyMs: Date.now() - tRmq,
        ...(rmq.error && { error: rmq.error }),
      };
    }

    const ok = Object.values(checks).every((c) => c.ok);
    const body = {
      ok,
      service: 'messaging-service',
      kind: 'readiness',
      checks,
      ...(rmq.queues && { rabbitQueues: rmq.queues }),
    };
    if (!ok) {
      throw new ServiceUnavailableException(body);
    }
    return body;
  }
}
