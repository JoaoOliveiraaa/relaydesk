import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
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
import type { RealtimeOutboundPayload } from '@relaydesk/shared-types';
import { EventsGateway } from './events.gateway';

function isRealtimeEnvelope(p: unknown): p is RealtimeOutboundPayload {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return o.v === 1 && typeof o.tenantId === 'string' && typeof o.conversationId === 'string';
}

@Injectable()
export class RealtimeBridgeService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(RealtimeBridgeService.name);
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;

  constructor(
    private readonly config: ConfigService,
    private readonly events: EventsGateway,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    this.conn = await createAmqpConnection(env.RABBITMQ_URL);
    this.ch = await this.conn.createConfirmChannel();
    await assertRelayTopology(this.ch);
    await consumeWithRetry(
      this.ch,
      QUEUES.realtimeOutbound,
      async (payload) => {
        if (!isRealtimeEnvelope(payload)) {
          this.logger.warn('Payload realtime inválido');
          return;
        }
        this.events.broadcastRelay(payload);
      },
      { prefetch: 50, maxRetries: 5 },
    );
    this.logger.log(`Bridge AMQP → Socket.IO na fila ${QUEUES.realtimeOutbound}`);
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
