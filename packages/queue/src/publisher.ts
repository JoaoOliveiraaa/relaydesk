import type { ConfirmChannel } from 'amqplib';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { EXCHANGE_MAIN } from './topology';
import { mergePublishTraceHeaders, type RelaydeskAmqpPublishAttrs } from './amqp-trace';

const HEADER_RETRY = 'x-relaydesk-retry';
const HEADER_MAX_RETRIES = 'x-relaydesk-max-retries';

export interface PublishOptions {
  correlationId?: string;
  messageId?: string;
  persistent?: boolean;
  headers?: Record<string, unknown>;
  /** RelayDesk semantic headers (mirrored on spans + propagated across workers). */
  relaydesk?: RelaydeskAmqpPublishAttrs;
}

const TRACER_NAME = '@relaydesk/queue';

export async function publishJson(
  ch: ConfirmChannel,
  routingKey: string,
  body: unknown,
  options: PublishOptions = {},
): Promise<void> {
  const tracer = trace.getTracer(TRACER_NAME);
  await tracer.startActiveSpan(
    'amqp.publish',
    {
      attributes: {
        'messaging.system': 'rabbitmq',
        'messaging.operation': 'publish',
        'messaging.destination.name': routingKey,
        ...(options.messageId && { 'messaging.message_id': options.messageId }),
        ...(options.relaydesk?.tenantId && { 'relaydesk.tenant_id': options.relaydesk.tenantId }),
        ...(options.relaydesk?.conversationId && { 'relaydesk.conversation_id': options.relaydesk.conversationId }),
        ...(options.relaydesk?.eventId && { 'relaydesk.event_id': options.relaydesk.eventId }),
        ...(options.relaydesk?.webhookDeliveryId && {
          'relaydesk.webhook_delivery_id': options.relaydesk.webhookDeliveryId,
        }),
      },
    },
    async (span) => {
      const buf = Buffer.from(JSON.stringify(body));
      const headers = mergePublishTraceHeaders(options.headers, options.relaydesk);
      try {
        ch.publish(EXCHANGE_MAIN, routingKey, buf, {
          persistent: options.persistent ?? true,
          correlationId: options.correlationId,
          messageId: options.messageId,
          contentType: 'application/json',
          headers,
        });
        await ch.waitForConfirms();
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (err) {
        span.recordException(err instanceof Error ? err : new Error(String(err)));
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw err;
      } finally {
        span.end();
      }
    },
  );
}

export function getRetryCount(msg: { properties: { headers?: Record<string, unknown> } }): number {
  const v = msg.properties.headers?.[HEADER_RETRY];
  return typeof v === 'number' ? v : 0;
}

export function nextRetryHeaders(
  msg: { properties: { headers?: Record<string, unknown> } },
  maxRetries: number,
): { headers: Record<string, unknown>; shouldDlq: boolean } {
  const current = getRetryCount(msg);
  const next = current + 1;
  const shouldDlq = next >= maxRetries;
  return {
    shouldDlq,
    headers: {
      ...msg.properties.headers,
      [HEADER_RETRY]: next,
      [HEADER_MAX_RETRIES]: maxRetries,
    },
  };
}

export { HEADER_RETRY, HEADER_MAX_RETRIES };
