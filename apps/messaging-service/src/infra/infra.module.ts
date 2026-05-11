import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { createRedis, type Redis } from '@relaydesk/redis';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AmqpPublisher } from './amqp.publisher';

export const REDIS = 'REDIS';

@Global()
@Module({
  imports: [
    ConfigModule,
    PrometheusModule.register({
      path: 'metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [
    AmqpPublisher,
    makeCounterProvider({
      name: 'relaydesk_amqp_published_total',
      help: 'Total de publicações AMQP confirmadas (messaging-service)',
      labelNames: ['routing_key'],
    }),
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
