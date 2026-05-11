import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import {
  assertRelayTopology,
  createAmqpConnection,
  publishJson,
  type AmqpConnection,
  type ConfirmChannel,
  type RelaydeskAmqpPublishAttrs,
} from '@relaydesk/queue';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter, Histogram } from 'prom-client';
import { CircuitBreaker } from '@relaydesk/common';

export type AmqpPublishContext = {
  messageId?: string;
  correlationId?: string;
  relaydesk?: RelaydeskAmqpPublishAttrs;
};

@Injectable()
export class AmqpPublisher implements OnModuleInit, OnModuleDestroy {
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;
  private readonly publishBreaker = new CircuitBreaker({
    name: 'amqp-publish',
    failureThreshold: 5,
    openDurationMs: 15_000,
    successThreshold: 2,
  });

  constructor(
    private readonly config: ConfigService,
    @InjectMetric('relaydesk_amqp_published_total')
    private readonly amqpPublished: Counter<string>,
    @InjectMetric('relaydesk_amqp_publish_duration_seconds')
    private readonly publishDuration: Histogram<string>,
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

  /**
   * @param messageIdOrCtx — compat: string = messageId, ou contexto completo com `relaydesk` attrs.
   */
  async publish(
    routingKey: string,
    body: unknown,
    messageIdOrCtx?: string | AmqpPublishContext,
  ): Promise<void> {
    const ctx: AmqpPublishContext =
      typeof messageIdOrCtx === 'string' ? { messageId: messageIdOrCtx, correlationId: messageIdOrCtx } : (messageIdOrCtx ?? {});
    const endTimer = this.publishDuration.startTimer({ routing_key: routingKey });
    try {
      await this.publishBreaker.execute(async () => {
        await publishJson(this.ch, routingKey, body, {
          messageId: ctx.messageId,
          correlationId: ctx.correlationId ?? ctx.messageId,
          relaydesk: ctx.relaydesk,
        });
      });
      this.amqpPublished.inc({ routing_key: routingKey });
    } finally {
      endTimer();
    }
  }
}
