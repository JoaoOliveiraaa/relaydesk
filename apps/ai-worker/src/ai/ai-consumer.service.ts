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
export class AiConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiConsumerService.name);
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
      QUEUES.aiProcessing,
      async (payload) => {
        this.logger.log(`AI pipeline (mock): ${JSON.stringify(payload)}`);
        // Futuro: chamar provedor LLM, gravar resposta, publicar notification.send
      },
      { prefetch: 5, maxRetries: 5 },
    );
    this.logger.log(`Consumindo fila ${QUEUES.aiProcessing}`);
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
