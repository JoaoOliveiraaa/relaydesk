import type { IncomingMessage } from '../messaging/incoming-message';
export declare const RELAY_EVENT_ROUTING: {
    readonly MESSAGE_RECEIVED: "message.received";
    readonly MESSAGE_PROCESSED: "message.processed";
    readonly AI_PROCESSING: "ai.processing";
    readonly WEBHOOK_DELIVERY: "webhook.delivery";
    readonly NOTIFICATION_SEND: "notification.send";
    /** Fan-out para WebSocket / clientes (bridge AMQP → Socket.IO). */
    readonly REALTIME_OUTBOUND: "realtime.outbound";
    /** Ingestão assíncrona após webhook de provider (Telegram, …). */
    readonly CHANNEL_INBOUND: "channel.inbound";
    /** Envio assíncrono para o provider (Telegram sendMessage, …). */
    readonly CHANNEL_OUTBOUND: "channel.outbound";
};
export type RelayRoutingKey = (typeof RELAY_EVENT_ROUTING)[keyof typeof RELAY_EVENT_ROUTING];
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
    /** ID of a WebhookEngineDelivery record. The worker fetches full context from DB. */
    deliveryId: string;
    tenantId: string;
    /** Kept for backwards compatibility with legacy WebhookEvent flow */
    webhookEventId?: string;
}
export interface NotificationSendPayload {
    tenantId: string;
    channel: 'email' | 'push' | 'in_app';
    to: string;
    template: string;
    data: Record<string, unknown>;
}
export type RealtimeOutboundType = 'message.created' | 'conversation.updated' | 'message.updated';
/** Contrato versionado para eventos push ao browser. */
export interface RealtimeOutboundPayload {
    v: 1;
    type: RealtimeOutboundType;
    tenantId: string;
    conversationId: string;
    correlationId?: string;
    payload: Record<string, unknown>;
}
/** Payload bruto do provider na fila de inbound (após validação HTTP). */
export interface ChannelInboundPayload {
    v: 1;
    provider: 'telegram';
    tenantId: string;
    connectionId: string;
    /** Update JSON do Telegram Bot API */
    update: Record<string, unknown>;
}
export interface ChannelOutboundPayload {
    v: 1;
    provider: 'telegram';
    tenantId: string;
    conversationId: string;
    messageId: string;
    channelConnectionId: string;
    chatId: string;
    text: string;
}
//# sourceMappingURL=domain-events.d.ts.map