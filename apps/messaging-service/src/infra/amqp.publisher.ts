import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import {
  assertRelayTopology,
  createAmqpConnection,
  publishJson,
  type AmqpConnection,
  type ConfirmChannel,
} from '@relaydesk/queue';

@Injectable()
export class AmqpPublisher implements OnModuleInit, OnModuleDestroy {
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    this.conn = await createAmqpConnection(env.RABBITMQ_URL);
    this.ch = await this.conn.createConfirmChannel();
    await assertRelayTopology(this.ch);
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

  publish(routingKey: string, body: unknown, messageId?: string): Promise<void> {
    return publishJson(this.ch, routingKey, body, { messageId });
  }
}
