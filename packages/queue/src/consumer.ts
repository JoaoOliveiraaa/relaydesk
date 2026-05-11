import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { EXCHANGE_MAIN } from './topology';
import { getRetryCount, nextRetryHeaders } from './publisher';
import { mergePublishTraceHeaders } from './amqp-trace';
import {
  applyPayloadCorrelationToSpan,
  applyRelaydeskHeadersToSpan,
  extractContextFromAmqpMessage,
} from './amqp-trace';

export interface ConsumeHandlerContext {
  ack: () => void;
  nackToDlq: () => void;
  /** Republica com backoff exponencial (segundos) antes de reprocessar */
  requeueWithBackoff: (seconds: number) => Promise<void>;
}

export interface AmqpConsumerHandle {
  /** Cancel consumer (drain stop — in-flight handler may still run). */
  cancel: () => Promise<void>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TRACER_NAME = '@relaydesk/queue';

/**
 * Consumer com ack manual, retry com backoff exponencial e DLQ após maxRetries.
 * Propagação W3C traceparent via headers AMQP + spans `amqp.consume`.
 * Corrige double-ack quando o handler usa `requeueWithBackoff` (marcação `settled`).
 */
export async function consumeWithRetry(
  ch: ConfirmChannel,
  queue: string,
  handler: (payload: unknown, raw: ConsumeMessage, ctx: ConsumeHandlerContext) => Promise<void>,
  opts: { prefetch?: number; maxRetries?: number } = {},
): Promise<AmqpConsumerHandle> {
  const prefetch = opts.prefetch ?? 10;
  const maxRetries = opts.maxRetries ?? 5;
  await ch.prefetch(prefetch);

  const { consumerTag } = await ch.consume(queue, async (msg) => {
    if (!msg) return;
    const parentCtx = extractContextFromAmqpMessage(msg);

    await context.with(parentCtx, async () => {
      const tracer = trace.getTracer(TRACER_NAME);
      await tracer.startActiveSpan(
        'amqp.consume',
        {
          attributes: {
            'messaging.system': 'rabbitmq',
            'messaging.operation': 'receive',
            'messaging.destination.name': queue,
            'messaging.message_id': msg.properties.messageId ?? '',
            'messaging.rabbitmq.routing_key': msg.fields.routingKey,
          },
        },
        async (span) => {
          applyRelaydeskHeadersToSpan(span, msg.properties.headers as Record<string, unknown> | undefined);

          let settled = false;
          const ack = () => {
            if (!settled) {
              ch.ack(msg);
              settled = true;
            }
          };
          const nackToDlq = () => {
            if (!settled) {
              ch.nack(msg, false, false);
              settled = true;
            }
          };

          const requeueWithBackoff = async (baseSeconds: number) => {
            const retry = getRetryCount(msg);
            const { shouldDlq, headers } = nextRetryHeaders(msg, maxRetries);
            if (shouldDlq) {
              nackToDlq();
              return;
            }
            const delayMs = Math.min(60_000, baseSeconds * 1000 * 2 ** retry);
            await sleep(delayMs);
            const mergedHeaders = mergePublishTraceHeaders(headers as Record<string, unknown>);
            ch.publish(EXCHANGE_MAIN, msg.fields.routingKey, msg.content, {
              persistent: true,
              headers: mergedHeaders,
              correlationId: msg.properties.correlationId,
              messageId: msg.properties.messageId,
              contentType: msg.properties.contentType ?? 'application/json',
            });
            await ch.waitForConfirms();
            ack();
          };

          const ctx: ConsumeHandlerContext = { ack, nackToDlq, requeueWithBackoff };

          try {
            let json: unknown;
            try {
              json = JSON.parse(msg.content.toString()) as unknown;
            } catch {
              span.setStatus({ code: SpanStatusCode.ERROR, message: 'invalid_json' });
              nackToDlq();
              return;
            }
            applyPayloadCorrelationToSpan(span, json);
            await handler(json, msg, ctx);
            if (!settled) ack();
            span.setStatus({ code: SpanStatusCode.OK });
          } catch (err) {
            span.recordException(err instanceof Error ? err : new Error(String(err)));
            span.setStatus({ code: SpanStatusCode.ERROR });
            await requeueWithBackoff(1);
          } finally {
            span.end();
          }
        },
      );
    });
  });

  return {
    cancel: async () => {
      try {
        await ch.cancel(consumerTag);
      } catch {
        /* ignore */
      }
    },
  };
}
