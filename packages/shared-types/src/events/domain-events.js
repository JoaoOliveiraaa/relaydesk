"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RELAY_EVENT_ROUTING = void 0;
exports.RELAY_EVENT_ROUTING = {
    MESSAGE_RECEIVED: 'message.received',
    MESSAGE_PROCESSED: 'message.processed',
    AI_PROCESSING: 'ai.processing',
    WEBHOOK_DELIVERY: 'webhook.delivery',
    NOTIFICATION_SEND: 'notification.send',
    /** Fan-out para WebSocket / clientes (bridge AMQP → Socket.IO). */
    REALTIME_OUTBOUND: 'realtime.outbound',
    /** Ingestão assíncrona após webhook de provider (Telegram, …). */
    CHANNEL_INBOUND: 'channel.inbound',
    /** Envio assíncrono para o provider (Telegram sendMessage, …). */
    CHANNEL_OUTBOUND: 'channel.outbound',
};
//# sourceMappingURL=domain-events.js.map