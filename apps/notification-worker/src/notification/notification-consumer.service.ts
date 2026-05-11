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

@Injectable()
export class NotificationConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationConsumerService.name);
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
      QUEUES.notificationSend,
      async (payload) => {
        this.logger.log(`Notificação (mock): ${JSON.stringify(payload)}`);
      },
      { prefetch: 20, maxRetries: 5 },
    );
    this.logger.log(`Consumindo fila ${QUEUES.notificationSend}`);
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
