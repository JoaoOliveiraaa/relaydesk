import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import {
  assertRelayTopology,
  consumeWithRetry,
  createAmqpConnection,
  QUEUES,
  type AmqpConnection,
  type AmqpConsumerHandle,
  type ConfirmChannel,
} from '@relaydesk/queue';

@Injectable()
export class AutomationConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutomationConsumerService.name);
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;
  private consumer?: AmqpConsumerHandle;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    this.conn = await createAmqpConnection(env.RABBITMQ_URL);
    this.ch = await this.conn.createConfirmChannel();
    await assertRelayTopology(this.ch);
    this.consumer = await consumeWithRetry(
      this.ch,
      QUEUES.messageProcessed,
      async (payload) => {
        this.logger.log(`Automação: message.processed → ${JSON.stringify(payload)}`);
        // Futuro: carregar Automation ativos do tenant e avaliar trigger JSON
      },
      { prefetch: 20, maxRetries: 5 },
    );
    this.logger.log(`Consumindo fila ${QUEUES.messageProcessed}`);
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.consumer?.cancel();
    } catch {
      /* ignore */
    }
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
