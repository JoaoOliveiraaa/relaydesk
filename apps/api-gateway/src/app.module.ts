import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { decodeJwtPayloadUnsafe, getClientIp } from '@relaydesk/common';
import type { RelayDeskEnv } from '@relaydesk/config';
import { loadEnv } from '@relaydesk/config';
import type { Redis } from '@relaydesk/redis';
import type { Request } from 'express';
import { GatewayModule } from './gateway/gateway.module';
import { HealthModule } from './health/health.module';
import { API_GATEWAY_REDIS, RedisInfraModule } from './infra/redis-infra.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ relayEnv: loadEnv(process.env) })],
    }),
    RedisInfraModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisInfraModule],
      inject: [ConfigService, API_GATEWAY_REDIS],
      useFactory: (config: ConfigService, redis: Redis) => {
        const env = config.get<RelayDeskEnv>('relayEnv')!;
        const isDev = env.NODE_ENV === 'development';
        return {
          skipIf: (ctx) => {
            if (ctx.getType() !== 'http') return true;
            const url = ctx.switchToHttp().getRequest<{ url?: string }>().url ?? '';
            return (
              url.startsWith('/health') ||
              url.startsWith('/metrics') ||
              url.startsWith('/docs') ||
              url.startsWith('/openapi.json')
            );
          },
          storage: new ThrottlerStorageRedisService(redis),
          throttlers: [
            {
              name: 'perIp',
              ttl: 60_000,
              limit: isDev ? 4000 : 800,
              getTracker: (req: Record<string, unknown>) => getClientIp(req as unknown as Request),
            },
            {
              name: 'perUser',
              ttl: 60_000,
              limit: isDev ? 2000 : 200,
              getTracker: (req: Record<string, unknown>) => {
                const r = req as unknown as Request;
                const token =
                  typeof r.headers?.authorization === 'string' && r.headers.authorization.startsWith('Bearer ')
                    ? r.headers.authorization.slice(7)
                    : undefined;
                const jwt = decodeJwtPayloadUnsafe(token);
                return jwt?.sub ? `user:${jwt.sub}` : `anon:${getClientIp(r)}`;
              },
            },
            {
              name: 'perTenant',
              ttl: 60_000,
              limit: isDev ? 20_000 : 5000,
              getTracker: (req: Record<string, unknown>) => {
                const r = req as unknown as Request;
                const token =
                  typeof r.headers?.authorization === 'string' && r.headers.authorization.startsWith('Bearer ')
                    ? r.headers.authorization.slice(7)
                    : undefined;
                const jwt = decodeJwtPayloadUnsafe(token);
                return jwt?.tenantId ? `tenant:${jwt.tenantId}` : `na:${getClientIp(r)}`;
              },
            },
          ],
        };
      },
    }),
    PrometheusModule.register({
      path: 'metrics',
      defaultMetrics: { enabled: true },
    }),
    HealthModule,
    GatewayModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
