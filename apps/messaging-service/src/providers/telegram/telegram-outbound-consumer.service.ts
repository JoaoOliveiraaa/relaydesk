import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { decryptCredential } from '@relaydesk/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter, Histogram } from 'prom-client';
import {
  assertRelayTopology,
  consumeWithRetry,
  createAmqpConnection,
  QUEUES,
  type AmqpConnection,
  type AmqpConsumerHandle,
  type ConfirmChannel,
} from '@relaydesk/queue';
import type { ChannelOutboundPayload } from '@relaydesk/shared-types';
import {
  MessageDeliveryStatus,
  Prisma,
  prisma,
  ProviderHealthStatus,
} from '@relaydesk/database';
import type { Redis } from '@relaydesk/redis';
import { RedisKeys } from '@relaydesk/redis';
import { REDIS } from '../../infra/infra.module';
import { TelegramApiClient } from './telegram-api.client';
import { MessagingService } from '../../messaging/messaging.service';

function isChannelOutboundPayload(p: unknown): p is ChannelOutboundPayload {
  return (
    typeof p === 'object' &&
    p !== null &&
    (p as { v?: number }).v === 1 &&
    (p as { provider?: string }).provider === 'telegram'
  );
}

@Injectable()
export class TelegramOutboundConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramOutboundConsumerService.name);
  private conn!: AmqpConnection;
  private ch!: ConfirmChannel;
  private consumer?: AmqpConsumerHandle;

  constructor(
    private readonly config: ConfigService,
    private readonly telegram: TelegramApiClient,
    private readonly messaging: MessagingService,
    @Inject(REDIS) private readonly redis: Redis,
    @InjectMetric('relaydesk_telegram_outbound_total')
    private readonly outboundCounter: Counter<string>,
    @InjectMetric('relaydesk_telegram_api_duration_seconds')
    private readonly apiDuration: Histogram<string>,
  ) {}

  async onModuleInit(): Promise<void> {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    this.conn = await createAmqpConnection(env.RABBITMQ_URL);
    this.ch = await this.conn.createConfirmChannel();
    await assertRelayTopology(this.ch);
    this.consumer = await consumeWithRetry(
      this.ch,
      QUEUES.channelOutbound,
      async (payload, raw, ctx) => {
        if (!isChannelOutboundPayload(payload)) {
          this.logger.warn('Payload channel.outbound inválido');
          this.outboundCounter.inc({ outcome: 'bad_payload' });
          return;
        }
        const correlationId =
          typeof raw.properties.correlationId === 'string'
            ? raw.properties.correlationId
            : undefined;

        const rlKey = RedisKeys.rateLimit(payload.tenantId, `tg:out:${payload.channelConnectionId}`);
        const n = await this.redis.incr(rlKey);
        if (n === 1) {
          await this.redis.expire(rlKey, 60);
        }
        if (n > 30) {
          this.outboundCounter.inc({ outcome: 'rate_limited' });
          await ctx.requeueWithBackoff(5);
          return;
        }

        const row = await prisma.channelConnection.findFirst({
          where: {
            id: payload.channelConnectionId,
            tenantId: payload.tenantId,
            channel: 'telegram',
            deletedAt: null,
          },
        });
        if (!row?.encryptedBotToken) {
          this.logger.error(`Sem credenciais para conexão ${payload.channelConnectionId}`);
          await prisma.message.update({
            where: { id: payload.messageId },
            data: { deliveryStatus: MessageDeliveryStatus.failed },
          });
          this.outboundCounter.inc({ outcome: 'no_credentials' });
          return;
        }

        const keyHex = env.RELAYDESK_CREDENTIALS_ENCRYPTION_KEY;
        let botToken: string;
        try {
          botToken = decryptCredential(row.encryptedBotToken, keyHex);
        } catch (e) {
          this.logger.error(e);
          await prisma.message.update({
            where: { id: payload.messageId },
            data: { deliveryStatus: MessageDeliveryStatus.failed },
          });
          this.outboundCounter.inc({ outcome: 'decrypt_error' });
          return;
        }

        const end = this.apiDuration.startTimer({ method: 'sendMessage' });
        let res: Awaited<ReturnType<TelegramApiClient['sendMessage']>>;
        try {
          res = await this.telegram.sendMessage(botToken, payload.chatId, payload.text);
        } finally {
          end();
        }

        if (!res.ok) {
          const retryAfter = res.parameters?.retry_after ?? 1;
          if (res.error_code === 429) {
            this.outboundCounter.inc({ outcome: 'telegram_429' });
            await ctx.requeueWithBackoff(Math.min(60, retryAfter));
            return;
          }
          this.logger.warn(`sendMessage falhou: ${res.description}`);
          await prisma.message.update({
            where: { id: payload.messageId },
            data: {
              deliveryStatus: MessageDeliveryStatus.failed,
              retryMetadata: { telegram: res } as Prisma.InputJsonValue,
            },
          });
          await prisma.channelConnection.update({
            where: { id: row.id },
            data: {
              providerHealth: ProviderHealthStatus.degraded,
              providerHealthDetail: res.description?.slice(0, 500) ?? 'send_failed',
              providerHealthCheckedAt: new Date(),
            },
          });
          const msgRow = await prisma.message.findUnique({ where: { id: payload.messageId } });
          if (msgRow) {
            await this.messaging.emitRealtimeMessageDelivery({
              tenantId: payload.tenantId,
              conversationId: payload.conversationId,
              message: msgRow,
              correlationId,
            });
          }
          this.outboundCounter.inc({ outcome: 'telegram_error' });
          return;
        }

        const msgRow = await prisma.message.update({
          where: { id: payload.messageId },
          data: {
            deliveryStatus: MessageDeliveryStatus.sent,
            metadata: { telegramMessageId: res.result.message_id } as Prisma.InputJsonValue,
          },
        });

        await prisma.channelConnection.update({
          where: { id: row.id },
          data: {
            outboundLastAt: new Date(),
            providerHealth: ProviderHealthStatus.healthy,
            providerHealthCheckedAt: new Date(),
            providerHealthDetail: null,
          },
        });

        await this.messaging.emitRealtimeMessageDelivery({
          tenantId: payload.tenantId,
          conversationId: payload.conversationId,
          message: msgRow,
          correlationId,
        });
        this.outboundCounter.inc({ outcome: 'ok' });
      },
      { prefetch: 10, maxRetries: 6 },
    );
    this.logger.log(`Telegram outbound em ${QUEUES.channelOutbound}`);
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
