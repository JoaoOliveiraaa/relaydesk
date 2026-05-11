import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter, Histogram, Gauge } from 'prom-client';

/**
 * Prometheus metrics for the Webhook Delivery Engine.
 *
 * Labels: event_type, status, tenant_id (hashed for cardinality safety)
 */
@Injectable()
export class WebhookMetricsService {
  constructor(
    @InjectMetric('relaydesk_webhook_deliveries_total')
    private readonly deliveriesTotal: Counter<string>,

    @InjectMetric('relaydesk_webhook_delivery_latency_ms')
    private readonly latencyHistogram: Histogram<string>,

    @InjectMetric('relaydesk_webhook_retries_total')
    private readonly retriesTotal: Counter<string>,

    @InjectMetric('relaydesk_webhook_failures_total')
    private readonly failuresTotal: Counter<string>,

    @InjectMetric('relaydesk_webhook_dlq_total')
    private readonly dlqTotal: Counter<string>,
  ) {}

  recordDelivery(eventType: string, status: 'success' | 'failure', latencyMs: number): void {
    this.deliveriesTotal.inc({ event_type: eventType, status });
    this.latencyHistogram.observe({ event_type: eventType }, latencyMs);
  }

  recordRetry(eventType: string): void {
    this.retriesTotal.inc({ event_type: eventType });
  }

  recordFailure(eventType: string, reason: string): void {
    this.failuresTotal.inc({ event_type: eventType, reason });
  }

  recordDlq(eventType: string): void {
    this.dlqTotal.inc({ event_type: eventType });
  }
}
