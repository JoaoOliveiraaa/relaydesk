import { Injectable, NotFoundException } from '@nestjs/common';
import type { Conversation, Message } from '@relaydesk/database';
import {
  Channel,
  MessageDeliveryStatus,
  MessageSenderType,
  MessageSource,
  Prisma,
  prisma,
} from '@relaydesk/database';

const inboxConversationSelect = {
  id: true,
  channel: true,
  customerName: true,
  customerExternalId: true,
  status: true,
  priority: true,
  lastMessageAt: true,
  lastMessagePreview: true,
  unreadCount: true,
  assignedToId: true,
  updatedAt: true,
} as const;

export type InboxConversationRow = Prisma.ConversationGetPayload<{ select: typeof inboxConversationSelect }>;
import {
  RELAY_EVENT_ROUTING,
  type ChannelOutboundPayload,
  type RealtimeOutboundPayload,
} from '@relaydesk/shared-types';
import type { JwtPayload } from '../auth/jwt.strategy';
import { AmqpPublisher } from '../infra/amqp.publisher';

@Injectable()
export class InboxService {
  constructor(private readonly amqp: AmqpPublisher) {}

  async assertConversationInTenant(conversationId: string, tenantId: string): Promise<Conversation> {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, tenantId, deletedAt: null },
    });
    if (!conv) {
      throw new NotFoundException('Conversa não encontrada');
    }
    return conv;
  }

  listConversations(user: JwtPayload): Promise<InboxConversationRow[]> {
    return prisma.conversation.findMany({
      where: { tenantId: user.tenantId, deletedAt: null },
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
      take: 100,
      select: inboxConversationSelect,
    });
  }

  async listMessages(conversationId: string, user: JwtPayload): Promise<Message[]> {
    await this.assertConversationInTenant(conversationId, user.tenantId);
    return prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      take: 300,
    });
  }

  async sendAgentMessage(
    conversationId: string,
    user: JwtPayload,
    content: string,
    correlationId?: string,
  ): Promise<Message> {
    await this.assertConversationInTenant(conversationId, user.tenantId);
    const conv = await prisma.conversation.findFirstOrThrow({
      where: { id: conversationId, tenantId: user.tenantId, deletedAt: null },
    });
    const telegramOutbound =
      conv.channel === Channel.telegram &&
      Boolean(conv.channelConnectionId) &&
      this.resolveTelegramChatId(conv.metadata, conv.customerExternalId) !== null;

    const { message, conversation } = await prisma.$transaction(async (tx) => {
      const m = await tx.message.create({
        data: {
          conversationId,
          senderType: MessageSenderType.agent,
          source: MessageSource.web_inbox,
          deliveryStatus: telegramOutbound
            ? MessageDeliveryStatus.pending
            : MessageDeliveryStatus.sent,
          content,
          sentByUserId: user.sub,
        },
      });
      const c = await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: content.slice(0, 512),
        },
        select: {
          id: true,
          lastMessageAt: true,
          lastMessagePreview: true,
          unreadCount: true,
        },
      });
      return { message: m, conversation: c };
    });

    await this.amqp.publish(
      RELAY_EVENT_ROUTING.MESSAGE_PROCESSED,
      {
        tenantId: user.tenantId,
        conversationId,
        messageId: message.id,
      },
      {
        messageId: message.id,
        correlationId: correlationId ?? message.id,
        relaydesk: {
          tenantId: user.tenantId,
          conversationId,
          eventId: message.id,
        },
      },
    );

    const envelope: RealtimeOutboundPayload = {
      v: 1,
      type: 'message.created',
      tenantId: user.tenantId,
      conversationId,
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
          id: conversation.id,
          lastMessagePreview: conversation.lastMessagePreview,
          lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
          unreadCount: conversation.unreadCount,
        },
      },
    };
    await this.amqp.publish(RELAY_EVENT_ROUTING.REALTIME_OUTBOUND, envelope, {
      messageId: message.id,
      correlationId: correlationId ?? message.id,
      relaydesk: {
        tenantId: user.tenantId,
        conversationId,
        eventId: message.id,
      },
    });

    if (telegramOutbound && conv.channelConnectionId) {
      const chatId = this.resolveTelegramChatId(conv.metadata, conv.customerExternalId)!;
      const outbound: ChannelOutboundPayload = {
        v: 1,
        provider: 'telegram',
        tenantId: user.tenantId,
        conversationId,
        messageId: message.id,
        channelConnectionId: conv.channelConnectionId,
        chatId,
        text: content,
      };
      await this.amqp.publish(RELAY_EVENT_ROUTING.CHANNEL_OUTBOUND, outbound, {
        messageId: `${message.id}:tg:out`,
        correlationId: correlationId ?? message.id,
        relaydesk: {
          tenantId: user.tenantId,
          conversationId,
          eventId: `${message.id}:tg:out`,
        },
      });
    }

    return message;
  }

  private resolveTelegramChatId(
    metadata: Prisma.JsonValue | null,
    customerExternalId: string | null,
  ): string | null {
    const m =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? (metadata as Record<string, unknown>)
        : {};
    if (typeof m.telegramChatId === 'number') {
      return String(m.telegramChatId);
    }
    if (customerExternalId?.startsWith('telegram:chat:')) {
      return customerExternalId.slice('telegram:chat:'.length);
    }
    if (customerExternalId && /^\d+$/.test(customerExternalId)) {
      return customerExternalId;
    }
    return null;
  }
}
