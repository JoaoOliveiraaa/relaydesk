import { ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { TelegramChannelAdapter } from '@relaydesk/channel-adapters';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter } from 'prom-client';
import {
  assertRelayTopology,
  consumeWithRetry,
  createAmqpConnection,
  QUEUES,
  type AmqpConnection,
  type AmqpConsumerHandle,
  type ConfirmChannel,
} from '@relaydesk/queue';
import type { ChannelInboundPayload } from '@relaydesk/shared-types';
import { prisma, ProviderHealthStatus } from '@relaydesk/database';
import { MessagingService } from '../../messaging/messaging.service';
import type { IngestMessageDto } from '../../messaging/dto/ingest-message.dto';

function isChannelInboundPayload(p: unknown): p is ChannelInboundPayload {
  return (
    typeof p === 'object' &&
    p !== null &&
    (p as { v?: number }).v === 1 &&
    (p as { provider?: string }).provider === 'telegram'
  );
}

@Injectable()
export class TelegramInboundConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramInboundConsumerService.name);
  private readonly adapter = new TelegramChannelAdapter();
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;
  private consumer?: AmqpConsumerHandle;

  constructor(
    private readonly config: ConfigService,
    private readonly messaging: MessagingService,
    @InjectMetric('relaydesk_telegram_inbound_processed_total')
    private readonly inboundMetric: Counter<string>,
  ) {}

  async onModuleInit(): Promise<void> {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    this.conn = await createAmqpConnection(env.RABBITMQ_URL);
    this.ch = await this.conn.createConfirmChannel();
    await assertRelayTopology(this.ch);
    this.consumer = await consumeWithRetry(
      this.ch,
      QUEUES.channelInbound,
      async (payload, raw) => {
        if (!isChannelInboundPayload(payload)) {
          this.logger.warn('Payload channel.inbound inválido');
          this.inboundMetric.inc({ outcome: 'bad_payload' });
          return;
        }
        const correlationId =
          typeof raw.properties.correlationId === 'string'
            ? raw.properties.correlationId
            : undefined;

        const row = await prisma.channelConnection.findFirst({
          where: {
            id: payload.connectionId,
            tenantId: payload.tenantId,
            channel: 'telegram',
            deletedAt: null,
          },
        });
        if (!row) {
          this.logger.warn(`ChannelConnection ausente: ${payload.connectionId}`);
          this.inboundMetric.inc({ outcome: 'missing_connection' });
          return;
        }

        const incoming = this.adapter.normalizeInbound(payload.update, {
          tenantId: payload.tenantId,
          channelConnectionId: payload.connectionId,
        });
        if (!incoming) {
          this.inboundMetric.inc({ outcome: 'skipped_update' });
          return;
        }

        const dto: IngestMessageDto = {
          id: incoming.id,
          tenantId: incoming.tenantId,
          channel: 'telegram',
          sender: incoming.sender,
          customerDisplayName: incoming.customerDisplayName,
          conversationThreadKey: incoming.conversationThreadKey,
          content: incoming.content,
          timestamp: incoming.timestamp.toISOString(),
          metadata: incoming.metadata,
          channelConnectionId: payload.connectionId,
        };

        try {
          await this.messaging.ingest(dto, correlationId);
          this.inboundMetric.inc({ outcome: 'ok' });
        } catch (e) {
          if (e instanceof ConflictException) {
            this.inboundMetric.inc({ outcome: 'duplicate' });
            return;
          }
          throw e;
        }

        void prisma.channelConnection
          .update({
            where: { id: row.id },
            data: {
              inboundLastAt: new Date(),
              providerHealth: ProviderHealthStatus.healthy,
              providerHealthCheckedAt: new Date(),
            },
          })
          .catch(() => undefined);
      },
      { prefetch: 20, maxRetries: 5 },
    );
    this.logger.log(`Telegram inbound em ${QUEUES.channelInbound}`);
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
