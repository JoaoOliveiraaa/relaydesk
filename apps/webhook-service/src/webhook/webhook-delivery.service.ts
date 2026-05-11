import { Injectable, Logger } from '@nestjs/common';
import { WebhookEngineDeliveryStatus, prisma } from '@relaydesk/database';
import type { ConsumeHandlerContext } from '@relaydesk/queue';
import type { ConsumeMessage } from 'amqplib';
import { CircuitBreaker, simWebhookForcedTimeoutMs } from '@relaydesk/common';
import { startActiveSpan } from '@relaydesk/otel';
import { HmacService } from './hmac.service';
import { WebhookMetricsService } from './webhook-metrics.service';

export interface WebhookDeliveryJob {
  deliveryId: string;
  tenantId: string;
}

/**
 * Core delivery engine — handles a single WebhookEngineDelivery record.
 *
 * Responsibilities:
 *  1. Load delivery + subscription from DB (single source of truth)
 *  2. Build signed headers (HMAC SHA-256)
 *  3. HTTP POST with timeout + circuit breaker
 *  4. Persist result (status, latency, response snippet, httpStatus)
 *  5. AuditLog entry
 *  6. Prometheus metrics + OpenTelemetry spans
 */
@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);
  private readonly httpBreaker = new CircuitBreaker({
    name: 'webhook-endpoint',
    failureThreshold: 10,
    openDurationMs: 30_000,
    successThreshold: 2,
  });

  constructor(
    private readonly hmac: HmacService,
    private readonly metrics: WebhookMetricsService,
  ) {}

  async deliver(
    job: WebhookDeliveryJob,
    raw: ConsumeMessage,
    ctx: ConsumeHandlerContext,
  ): Promise<void> {
    const { deliveryId, tenantId } = job;

    const delivery = await prisma.webhookEngineDelivery.findFirst({
      where: { id: deliveryId, tenantId },
      include: { subscription: true },
    });

    if (!delivery) {
      this.logger.warn(`Delivery ${deliveryId} not found — discarding`);
      ctx.ack();
      return;
    }

    if (delivery.status === WebhookEngineDeliveryStatus.delivered) {
      this.logger.debug(`Delivery ${deliveryId} already delivered — idempotent ack`);
      ctx.ack();
      return;
    }

    if (delivery.subscription.state !== 'active') {
      this.logger.log(`Subscription ${delivery.subscriptionId} is paused — skipping delivery ${deliveryId}`);
      await prisma.webhookEngineDelivery.update({
        where: { id: deliveryId },
        data: { status: WebhookEngineDeliveryStatus.failed, lastError: 'Subscription is paused' },
      });
      ctx.ack();
      return;
    }

    await prisma.webhookEngineDelivery.update({
      where: { id: deliveryId },
      data: { status: WebhookEngineDeliveryStatus.sending, attempts: { increment: 1 } },
    });

    const body = JSON.stringify(delivery.payload);
    const signatureHeaders = this.hmac.buildHeaders(
      delivery.subscription.signingSecret,
      body,
      delivery.eventType,
      deliveryId,
    );

    const retryPolicy = this.extractRetryPolicy(delivery.subscription.metadata);
    const simMs = simWebhookForcedTimeoutMs();
    const timeoutMs =
      simMs > 0 ? Math.min(retryPolicy.timeoutSeconds * 1000, simMs) : retryPolicy.timeoutSeconds * 1000;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startMs = Date.now();
    let httpStatus: number | undefined;
    let responseSnippet: string | undefined;
    let lastError: string | undefined;
    let success = false;

    try {
      await startActiveSpan('relaydesk.webhook', 'webhook.delivery.http', {}, async (span) => {
        span.setAttribute('relaydesk.tenant_id', tenantId);
        span.setAttribute('relaydesk.webhook_delivery_id', deliveryId);
        span.setAttribute('relaydesk.event_type', delivery.eventType);
        span.setAttribute('http.url', delivery.subscription.url);
        if (delivery.correlationId) span.setAttribute('relaydesk.correlation_id', delivery.correlationId);

        await this.httpBreaker.execute(async () => {
          const resp = await fetch(delivery.subscription.url, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'user-agent': 'RelayDesk-Webhook/1.0',
              ...signatureHeaders,
            },
            body,
            signal: controller.signal,
          });

          httpStatus = resp.status;
          const text = await resp.text().catch(() => '');
          responseSnippet = text.slice(0, 1024);
          success = resp.status >= 200 && resp.status < 300;
          span.setAttribute('http.status_code', resp.status);
          if (!success) {
            lastError = `HTTP ${resp.status}: ${responseSnippet.slice(0, 256)}`;
          }
        });
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Delivery ${deliveryId} HTTP error: ${lastError}`);
    } finally {
      clearTimeout(timeout);
    }

    const latencyMs = Date.now() - startMs;

    if (success) {
      await prisma.webhookEngineDelivery.update({
        where: { id: deliveryId },
        data: {
          status: WebhookEngineDeliveryStatus.delivered,
          httpStatus,
          responseSnippet,
          lastError: null,
        },
      });

      await this.writeAudit(tenantId, deliveryId, delivery.eventType, 'webhook.delivered', { latencyMs, httpStatus });
      this.metrics.recordDelivery(delivery.eventType, 'success', latencyMs);
      this.logger.log(
        `[${deliveryId}] delivered ${delivery.eventType} → ${delivery.subscription.url} (${latencyMs}ms, HTTP ${httpStatus ?? '?'})`,
      );
      ctx.ack();
    } else {
      const attempt = delivery.attempts + 1;
      const maxAttempts = retryPolicy.maxAttempts;
      const isDead = attempt >= maxAttempts;

      await prisma.webhookEngineDelivery.update({
        where: { id: deliveryId },
        data: {
          status: isDead ? WebhookEngineDeliveryStatus.dead : WebhookEngineDeliveryStatus.failed,
          httpStatus: httpStatus ?? null,
          responseSnippet: responseSnippet ?? null,
          lastError: lastError ?? 'Unknown error',
          nextAttemptAt: isDead ? null : new Date(Date.now() + this.backoffMs(attempt, retryPolicy)),
        },
      });

      this.metrics.recordDelivery(delivery.eventType, 'failure', latencyMs);

      if (isDead) {
        await this.writeAudit(tenantId, deliveryId, delivery.eventType, 'webhook.dead', { attempt, lastError });
        this.metrics.recordDlq(delivery.eventType);
        this.logger.error(`[${deliveryId}] dead after ${attempt} attempts: ${lastError ?? ''}`);
        ctx.nackToDlq();
      } else {
        this.metrics.recordRetry(delivery.eventType);
        this.logger.warn(`[${deliveryId}] attempt ${attempt}/${maxAttempts} failed — retrying with backoff`);
        const backoffSeconds = Math.ceil(this.backoffMs(attempt, retryPolicy) / 1000);
        await ctx.requeueWithBackoff(backoffSeconds);
      }
    }
  }

  private backoffMs(
    attempt: number,
    retryPolicy: { backoffBase: number; backoffCap: number },
  ): number {
    const jitter = Math.random() * 1000;
    const delay = Math.min(
      retryPolicy.backoffCap * 1000,
      retryPolicy.backoffBase * 1000 * Math.pow(2, attempt - 1),
    );
    return delay + jitter;
  }

  private async writeAudit(
    tenantId: string,
    deliveryId: string,
    eventType: string,
    action: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId,
          actorService: 'webhook-service',
          action,
          entityType: 'WebhookEngineDelivery',
          entityId: deliveryId,
          metadata: { eventType, ...metadata },
          correlationId: deliveryId,
        },
      });
    } catch (err) {
      this.logger.warn(`AuditLog write failed for delivery ${deliveryId}: ${String(err)}`);
    }
  }

  private extractRetryPolicy(metadata: unknown): {
    maxAttempts: number;
    backoffBase: number;
    backoffCap: number;
    timeoutSeconds: number;
  } {
    const defaults = { maxAttempts: 5, backoffBase: 2, backoffCap: 300, timeoutSeconds: 30 };
    if (metadata && typeof metadata === 'object' && 'retryPolicy' in metadata) {
      return { ...defaults, ...(metadata as Record<string, unknown>).retryPolicy as object };
    }
    return defaults;
  }
}
