import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { createRedis, type Redis } from '@relaydesk/redis';

export const API_GATEWAY_REDIS = 'API_GATEWAY_REDIS';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: API_GATEWAY_REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const env = config.get<RelayDeskEnv>('relayEnv')!;
        return createRedis(env.REDIS_URL, env.REDIS_KEY_PREFIX);
      },
    },
  ],
  exports: [API_GATEWAY_REDIS],
})
export class RedisInfraModule {}
