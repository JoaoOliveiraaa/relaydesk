import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { createRedis, type Redis } from '@relaydesk/redis';
import { AmqpPublisher } from './amqp.publisher';

export const REDIS = 'REDIS';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    AmqpPublisher,
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const env = config.get<RelayDeskEnv>('relayEnv')!;
        return createRedis(env.REDIS_URL, env.REDIS_KEY_PREFIX);
      },
    },
  ],
  exports: [REDIS, AmqpPublisher],
})
export class InfraModule {}
