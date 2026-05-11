import type { ConfirmChannel } from 'amqplib';

/** Exchange principal (topic) — roteamento por routing key de domínio */
export const EXCHANGE_MAIN = 'relaydesk.events';
/** Exchange DLX — mensagens rejeitadas após esgotar tentativas */
export const EXCHANGE_DLX = 'relaydesk.dlx';

export const QUEUES = {
  messageReceived: 'q.message.received',
  messageReceivedDlq: 'q.message.received.dlq',
  messageProcessed: 'q.message.processed',
  messageProcessedDlq: 'q.message.processed.dlq',
  aiProcessing: 'q.ai.processing',
  aiProcessingDlq: 'q.ai.processing.dlq',
  webhookDelivery: 'q.webhook.delivery',
  webhookDeliveryDlq: 'q.webhook.delivery.dlq',
  notificationSend: 'q.notification.send',
  notificationSendDlq: 'q.notification.send.dlq',
  realtimeOutbound: 'q.realtime.outbound',
  realtimeOutboundDlq: 'q.realtime.outbound.dlq',
  channelInbound: 'q.channel.inbound',
  channelInboundDlq: 'q.channel.inbound.dlq',
  channelOutbound: 'q.channel.outbound',
  channelOutboundDlq: 'q.channel.outbound.dlq',
} as const;

const MAIN_ARGS = {
  durable: true,
} as const;

const DLQ_ARGS = { durable: true } as const;

/**
 * Declara topologia RabbitMQ: topic exchange, filas classic com DLX e bindings.
 * Classic maximiza compatibilidade local; em produção avalie quorum + políticas de cluster.
 */
export async function assertRelayTopology(ch: ConfirmChannel): Promise<void> {
  await ch.assertExchange(EXCHANGE_MAIN, 'topic', MAIN_ARGS);
  await ch.assertExchange(EXCHANGE_DLX, 'topic', MAIN_ARGS);

  const dlx = (dlqRk: string) => ({
    durable: true,
    deadLetterExchange: EXCHANGE_DLX,
    deadLetterRoutingKey: dlqRk,
  });

  await ch.assertQueue(QUEUES.messageReceived, dlx('message.received.dlq'));
  await ch.assertQueue(QUEUES.messageReceivedDlq, DLQ_ARGS);
  await ch.bindQueue(QUEUES.messageReceived, EXCHANGE_MAIN, 'message.received');
  await ch.bindQueue(QUEUES.messageReceivedDlq, EXCHANGE_DLX, 'message.received.dlq');

  await ch.assertQueue(QUEUES.messageProcessed, dlx('message.processed.dlq'));
  await ch.assertQueue(QUEUES.messageProcessedDlq, DLQ_ARGS);
  await ch.bindQueue(QUEUES.messageProcessed, EXCHANGE_MAIN, 'message.processed');
  await ch.bindQueue(QUEUES.messageProcessedDlq, EXCHANGE_DLX, 'message.processed.dlq');

  await ch.assertQueue(QUEUES.aiProcessing, dlx('ai.processing.dlq'));
  await ch.assertQueue(QUEUES.aiProcessingDlq, DLQ_ARGS);
  await ch.bindQueue(QUEUES.aiProcessing, EXCHANGE_MAIN, 'ai.processing');
  await ch.bindQueue(QUEUES.aiProcessingDlq, EXCHANGE_DLX, 'ai.processing.dlq');

  await ch.assertQueue(QUEUES.webhookDelivery, dlx('webhook.delivery.dlq'));
  await ch.assertQueue(QUEUES.webhookDeliveryDlq, DLQ_ARGS);
  await ch.bindQueue(QUEUES.webhookDelivery, EXCHANGE_MAIN, 'webhook.delivery');
  await ch.bindQueue(QUEUES.webhookDeliveryDlq, EXCHANGE_DLX, 'webhook.delivery.dlq');

  await ch.assertQueue(QUEUES.notificationSend, dlx('notification.send.dlq'));
  await ch.assertQueue(QUEUES.notificationSendDlq, DLQ_ARGS);
  await ch.bindQueue(QUEUES.notificationSend, EXCHANGE_MAIN, 'notification.send');
  await ch.bindQueue(QUEUES.notificationSendDlq, EXCHANGE_DLX, 'notification.send.dlq');

  await ch.assertQueue(QUEUES.realtimeOutbound, dlx('realtime.outbound.dlq'));
  await ch.assertQueue(QUEUES.realtimeOutboundDlq, DLQ_ARGS);
  await ch.bindQueue(QUEUES.realtimeOutbound, EXCHANGE_MAIN, 'realtime.outbound');
  await ch.bindQueue(QUEUES.realtimeOutboundDlq, EXCHANGE_DLX, 'realtime.outbound.dlq');

  await ch.assertQueue(QUEUES.channelInbound, dlx('channel.inbound.dlq'));
  await ch.assertQueue(QUEUES.channelInboundDlq, DLQ_ARGS);
  await ch.bindQueue(QUEUES.channelInbound, EXCHANGE_MAIN, 'channel.inbound');
  await ch.bindQueue(QUEUES.channelInboundDlq, EXCHANGE_DLX, 'channel.inbound.dlq');

  await ch.assertQueue(QUEUES.channelOutbound, dlx('channel.outbound.dlq'));
  await ch.assertQueue(QUEUES.channelOutboundDlq, DLQ_ARGS);
  await ch.bindQueue(QUEUES.channelOutbound, EXCHANGE_MAIN, 'channel.outbound');
  await ch.bindQueue(QUEUES.channelOutboundDlq, EXCHANGE_DLX, 'channel.outbound.dlq');
}
