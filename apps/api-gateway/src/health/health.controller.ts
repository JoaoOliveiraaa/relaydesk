import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import type { Redis } from '@relaydesk/redis';
import { API_GATEWAY_REDIS } from '../infra/redis-infra.module';

@Controller('health')
export class HealthController {
  constructor(@Inject(API_GATEWAY_REDIS) private readonly redis: Redis) {}

  /** Compat: resposta mínima (load balancers simples). */
  @Get()
  check() {
    return { status: 'ok', service: 'api-gateway' };
  }

  @Get('live')
  liveness() {
    return { ok: true, service: 'api-gateway', kind: 'liveness' };
  }

  @Get('ready')
  async readiness() {
    const t0 = Date.now();
    try {
      await this.redis.ping();
    } catch (e) {
      throw new ServiceUnavailableException({
        ok: false,
        service: 'api-gateway',
        kind: 'readiness',
        checks: {
          redis: {
            ok: false,
            error: e instanceof Error ? e.message : 'redis_error',
          },
        },
      });
    }
    return {
      ok: true,
      service: 'api-gateway',
      kind: 'readiness',
      checks: {
        redis: { ok: true, latencyMs: Date.now() - t0 },
      },
    };
  }
}
