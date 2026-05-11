import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import {
  assertRelayTopology,
  consumeWithRetry,
  createAmqpConnection,
  QUEUES,
  type AmqpConnection,
  type ConfirmChannel,
} from '@relaydesk/queue';
import { WebhookDeliveryService, type WebhookDeliveryJob } from './webhook-delivery.service';

/**
 * Consumes `q.webhook.delivery` and delegates to WebhookDeliveryService.
 *
 * The delivery job only carries the deliveryId — the service fetches the full
 * record from Postgres to ensure consistency and prevent stale payloads.
 */
@Injectable()
export class WebhookConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebhookConsumerService.name);
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;

  constructor(
    private readonly config: ConfigService,
    private readonly deliveryService: WebhookDeliveryService,
  ) {}

  async onModuleInit(): Promise<void> {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    this.conn = await createAmqpConnection(env.RABBITMQ_URL);
    this.ch = await this.conn.createConfirmChannel();
    await assertRelayTopology(this.ch);

    await consumeWithRetry(
      this.ch,
      QUEUES.webhookDelivery,
      async (payload, raw, ctx) => {
        const job = payload as WebhookDeliveryJob;
        if (!job.deliveryId || !job.tenantId) {
          this.logger.warn(`Malformed webhook job, discarding: ${JSON.stringify(payload)}`);
          ctx.nackToDlq();
          return;
        }
        await this.deliveryService.deliver(job, raw, ctx);
      },
      { prefetch: 5, maxRetries: 5 },
    );

    this.logger.log(`Webhook delivery engine consuming ${QUEUES.webhookDelivery}`);
  }

  async onModuleDestroy(): Promise<void> {
    try { await this.ch?.close(); } catch { /* ignore */ }
    try { await this.conn?.close(); } catch { /* ignore */ }
  }
}
