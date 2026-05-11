import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { createRedis } from '@relaydesk/redis';
import type { Redis } from '@relaydesk/redis';

export const AUTH_REDIS = 'AUTH_REDIS';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AUTH_REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const env = config.get<RelayDeskEnv>('relayEnv')!;
        return createRedis(env.REDIS_URL, env.REDIS_KEY_PREFIX);
      },
    },
  ],
  exports: [AUTH_REDIS],
})
export class RedisInfraModule {}
