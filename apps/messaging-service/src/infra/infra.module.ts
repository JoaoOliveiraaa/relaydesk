import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { createRedis, type Redis } from '@relaydesk/redis';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
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
    makeHistogramProvider({
      name: 'relaydesk_amqp_publish_duration_seconds',
      help: 'Latência de publish AMQP confirmado (segundos)',
      labelNames: ['routing_key'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
      name: 'relaydesk_telegram_webhook_enqueued_total',
      help: 'Updates Telegram aceites no edge HTTP e enfileirados',
      labelNames: ['outcome'],
    }),
    makeCounterProvider({
      name: 'relaydesk_telegram_inbound_processed_total',
      help: 'Mensagens Telegram normalizadas e entregues ao ingest',
      labelNames: ['outcome'],
    }),
    makeCounterProvider({
      name: 'relaydesk_telegram_outbound_total',
      help: 'Tentativas de envio Telegram (sendMessage)',
      labelNames: ['outcome'],
    }),
    makeHistogramProvider({
      name: 'relaydesk_telegram_api_duration_seconds',
      help: 'Latência chamadas HTTP à Telegram Bot API (segundos)',
      labelNames: ['method'],
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 15, 30],
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
