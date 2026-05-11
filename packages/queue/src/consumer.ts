import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { EXCHANGE_MAIN } from './topology';
import { getRetryCount, nextRetryHeaders } from './publisher';

export interface ConsumeHandlerContext {
  ack: () => void;
  nackToDlq: () => void;
  /** Republica com backoff exponencial (segundos) antes de reprocessar */
  requeueWithBackoff: (seconds: number) => Promise<void>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Consumer com ack manual, retry com backoff exponencial e DLQ após maxRetries.
 */
export async function consumeWithRetry(
  ch: ConfirmChannel,
  queue: string,
  handler: (payload: unknown, raw: ConsumeMessage, ctx: ConsumeHandlerContext) => Promise<void>,
  opts: { prefetch?: number; maxRetries?: number } = {},
): Promise<void> {
  const prefetch = opts.prefetch ?? 10;
  const maxRetries = opts.maxRetries ?? 5;
  await ch.prefetch(prefetch);

  await ch.consume(queue, async (msg) => {
    if (!msg) return;
    const ack = () => ch.ack(msg);
    const nackToDlq = () => ch.nack(msg, false, false);

    const requeueWithBackoff = async (baseSeconds: number) => {
      const retry = getRetryCount(msg);
      const { shouldDlq, headers } = nextRetryHeaders(msg, maxRetries);
      if (shouldDlq) {
        nackToDlq();
        return;
      }
      const delayMs = Math.min(60_000, baseSeconds * 1000 * 2 ** retry);
      await sleep(delayMs);
      ch.publish(EXCHANGE_MAIN, msg.fields.routingKey, msg.content, {
        persistent: true,
        headers,
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
        nackToDlq();
        return;
      }
      await handler(json, msg, ctx);
      ack();
    } catch {
      await requeueWithBackoff(1);
    }
  });
}
