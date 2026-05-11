import type { IncomingMessage } from '../messaging/incoming-message';

export const RELAY_EVENT_ROUTING = {
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_PROCESSED: 'message.processed',
  AI_PROCESSING: 'ai.processing',
  WEBHOOK_DELIVERY: 'webhook.delivery',
  NOTIFICATION_SEND: 'notification.send',
  /** Fan-out para WebSocket / clientes (bridge AMQP → Socket.IO). */
  REALTIME_OUTBOUND: 'realtime.outbound',
} as const;

export type RelayRoutingKey =
  (typeof RELAY_EVENT_ROUTING)[keyof typeof RELAY_EVENT_ROUTING];

export interface MessageReceivedPayload {
  message: IncomingMessage;
  conversationId?: string;
}

export interface MessageProcessedPayload {
  tenantId: string;
  conversationId: string;
  messageId: string;
}

export interface AiProcessingPayload {
  tenantId: string;
  conversationId: string;
  messageId: string;
  promptContext?: Record<string, unknown>;
}

export interface WebhookDeliveryPayload {
  tenantId: string;
  webhookEventId: string;
  targetUrl: string;
  signingSecret?: string;
  body: Record<string, unknown>;
}

export interface NotificationSendPayload {
  tenantId: string;
  channel: 'email' | 'push' | 'in_app';
  to: string;
  template: string;
  data: Record<string, unknown>;
}

export type RealtimeOutboundType = 'message.created' | 'conversation.updated';

/** Contrato versionado para eventos push ao browser. */
export interface RealtimeOutboundPayload {
  v: 1;
  type: RealtimeOutboundType;
  tenantId: string;
  conversationId: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}
