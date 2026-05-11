import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  Channel,
  ConversationStatus,
  MessageDeliveryStatus,
  MessageSenderType,
  MessageSource,
  ParticipantRole,
  Prisma,
  prisma,
  QueueJobStatus,
  QueueJobType,
} from '@relaydesk/database';
import {
  RELAY_EVENT_ROUTING,
  type MessageReceivedPayload,
  type RealtimeOutboundPayload,
} from '@relaydesk/shared-types';
import type { Redis } from '@relaydesk/redis';
import { RedisKeys } from '@relaydesk/redis';
import { AmqpPublisher } from '../infra/amqp.publisher';
import { REDIS } from '../infra/infra.module';
import type { IngestMessageDto } from './dto/ingest-message.dto';
import { WebhookEventPublisher } from '../webhooks/webhook-event.publisher';

@Injectable()
export class MessagingService {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly amqp: AmqpPublisher,
    private readonly webhookPublisher: WebhookEventPublisher,
  ) {}

  async ingest(dto: IngestMessageDto, correlationId?: string) {
    const idemKey = RedisKeys.idempotency(`${dto.tenantId}:${dto.id}`);
    const locked = await this.redis.set(idemKey, '1', 'EX', 86_400, 'NX');
    if (locked !== 'OK') {
      throw new ConflictException('Mensagem já processada (idempotência)');
    }

    const tenant = await prisma.tenant.findFirst({
      where: { id: dto.tenantId, deletedAt: null },
    });
    if (!tenant) {
      await this.redis.del(idemKey);
      throw new NotFoundException('Tenant não encontrado');
    }

    const channelEnum = dto.channel as Channel;
    const participantKey = `ext:${dto.sender}`;

    const { conversation, message } = await prisma.$transaction(async (tx) => {
      let conversation = await tx.conversation.findFirst({
        where: {
          tenantId: dto.tenantId,
          channel: channelEnum,
          customerExternalId: dto.sender,
          deletedAt: null,
        },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            tenantId: dto.tenantId,
            channel: channelEnum,
            customerName: dto.sender,
            customerExternalId: dto.sender,
            status: ConversationStatus.open,
            lastMessageAt: new Date(dto.timestamp),
            lastMessagePreview: dto.content.slice(0, 512),
            unreadCount: 1,
          },
        });
      } else {
        conversation = await tx.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(dto.timestamp),
            lastMessagePreview: dto.content.slice(0, 512),
            unreadCount: { increment: 1 },
          },
        });
      }

      await tx.conversationParticipant.upsert({
        where: {
          conversationId_participantKey: {
            conversationId: conversation.id,
            participantKey,
          },
        },
        create: {
          tenantId: dto.tenantId,
          conversationId: conversation.id,
          role: ParticipantRole.customer,
          participantKey,
          externalId: dto.sender,
          displayName: dto.sender,
        },
        update: {
          displayName: dto.sender,
          deletedAt: null,
        },
      });

      const message = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderType: MessageSenderType.customer,
          source: MessageSource.omnichannel_inbound,
          deliveryStatus: MessageDeliveryStatus.delivered,
          content: dto.content,
          metadata: (dto.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
          externalId: dto.id,
        },
      });

      await tx.queueJob.create({
        data: {
          tenantId: dto.tenantId,
          type: QueueJobType.message_pipeline,
          payload: { messageId: message.id, conversationId: conversation.id },
          status: QueueJobStatus.pending,
        },
      });

      return { conversation, message };
    });

    const payload: MessageReceivedPayload = {
      conversationId: conversation.id,
      message: {
        id: dto.id,
        tenantId: dto.tenantId,
        channel: dto.channel,
        sender: dto.sender,
        content: dto.content,
        timestamp: new Date(dto.timestamp),
        metadata: dto.metadata,
      },
    };

    await this.amqp.publish(RELAY_EVENT_ROUTING.MESSAGE_RECEIVED, payload, dto.id);
    await this.amqp.publish(
      RELAY_EVENT_ROUTING.MESSAGE_PROCESSED,
      {
        tenantId: dto.tenantId,
        conversationId: conversation.id,
        messageId: message.id,
      },
      `${dto.id}:processed`,
    );
    await this.amqp.publish(
      RELAY_EVENT_ROUTING.AI_PROCESSING,
      {
        tenantId: dto.tenantId,
        conversationId: conversation.id,
        messageId: message.id,
      },
      `${dto.id}:ai`,
    );

    const refreshed = await prisma.conversation.findUniqueOrThrow({
      where: { id: conversation.id },
    });

    const envelope: RealtimeOutboundPayload = {
      v: 1,
      type: 'message.created',
      tenantId: dto.tenantId,
      conversationId: conversation.id,
      correlationId,
      payload: {
        message: {
          id: message.id,
          content: message.content,
          senderType: message.senderType,
          source: message.source,
          deliveryStatus: message.deliveryStatus,
          sentByUserId: message.sentByUserId,
          createdAt: message.createdAt.toISOString(),
        },
        conversation: {
          id: refreshed.id,
          lastMessagePreview: refreshed.lastMessagePreview,
          lastMessageAt: refreshed.lastMessageAt?.toISOString() ?? null,
          unreadCount: refreshed.unreadCount,
        },
      },
    };
    await this.amqp.publish(RELAY_EVENT_ROUTING.REALTIME_OUTBOUND, envelope, message.id);

    // Fire webhook events to all matching subscriptions (non-blocking)
    this.webhookPublisher
      .publish(
        dto.tenantId,
        'message.received',
        {
          messageId: message.id,
          conversationId: conversation.id,
          channel: dto.channel,
          sender: dto.sender,
          contentPreview: dto.content.slice(0, 256),
          timestamp: new Date(dto.timestamp).toISOString(),
        },
        correlationId,
      )
      .catch((err) => {
        // Webhook fan-out errors must never block message ingestion
        void err;
      });

    return {
      conversationId: conversation.id,
      messageId: message.id,
      queued: [
        RELAY_EVENT_ROUTING.MESSAGE_RECEIVED,
        RELAY_EVENT_ROUTING.REALTIME_OUTBOUND,
      ],
    };
  }
}
