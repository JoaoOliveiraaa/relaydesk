import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { WebhookEventStatus, prisma } from '@relaydesk/database';
import {
  assertRelayTopology,
  consumeWithRetry,
  createAmqpConnection,
  QUEUES,
  type AmqpConnection,
  type ConfirmChannel,
} from '@relaydesk/queue';

@Injectable()
export class WebhookConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebhookConsumerService.name);
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    this.conn = await createAmqpConnection(env.RABBITMQ_URL);
    this.ch = await this.conn.createConfirmChannel();
    await assertRelayTopology(this.ch);
    await consumeWithRetry(
      this.ch,
      QUEUES.webhookDelivery,
      async (payload) => {
        const body = payload as { webhookEventId?: string; tenantId?: string };
        this.logger.log(`Webhook delivery recebido: ${JSON.stringify(body)}`);
        if (body.webhookEventId) {
          await prisma.webhookEvent.updateMany({
            where: { id: body.webhookEventId },
            data: { status: WebhookEventStatus.delivered },
          });
        }
      },
      { prefetch: 5, maxRetries: 5 },
    );
    this.logger.log(`Consumindo fila ${QUEUES.webhookDelivery}`);
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.ch?.close();
    } catch {
      /* ignore */
    }
    try {
      await this.conn?.close();
    } catch {
      /* ignore */
    }
  }
}
