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
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter } from 'prom-client';

@Injectable()
export class AmqpPublisher implements OnModuleInit, OnModuleDestroy {
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;

  constructor(
    private readonly config: ConfigService,
    @InjectMetric('relaydesk_amqp_published_total')
    private readonly amqpPublished: Counter<string>,
  ) {}

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

  async publish(routingKey: string, body: unknown, messageId?: string): Promise<void> {
    await publishJson(this.ch, routingKey, body, { messageId });
    this.amqpPublished.inc({ routing_key: routingKey });
  }
}
