import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { WebhookConsumerService } from './webhook-consumer.service';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { HmacService } from './hmac.service';
import { WebhookMetricsService } from './webhook-metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [
    WebhookConsumerService,
    WebhookDeliveryService,
    HmacService,
    WebhookMetricsService,

    makeCounterProvider({
      name: 'relaydesk_webhook_deliveries_total',
      help: 'Total webhook delivery attempts',
      labelNames: ['event_type', 'status'],
    }),
    makeHistogramProvider({
      name: 'relaydesk_webhook_delivery_latency_ms',
      help: 'Webhook HTTP delivery latency in milliseconds',
      labelNames: ['event_type'],
      buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000],
    }),
    makeCounterProvider({
      name: 'relaydesk_webhook_retries_total',
      help: 'Total webhook delivery retries',
      labelNames: ['event_type'],
    }),
    makeCounterProvider({
      name: 'relaydesk_webhook_failures_total',
      help: 'Total failed webhook deliveries',
      labelNames: ['event_type', 'reason'],
    }),
    makeCounterProvider({
      name: 'relaydesk_webhook_dlq_total',
      help: 'Webhooks sent to dead letter queue',
      labelNames: ['event_type'],
    }),
  ],
})
export class WebhookConsumerModule {}
