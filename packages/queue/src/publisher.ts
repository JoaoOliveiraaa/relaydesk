import type { ConfirmChannel } from 'amqplib';
import { EXCHANGE_MAIN } from './topology';

const HEADER_RETRY = 'x-relaydesk-retry';
const HEADER_MAX_RETRIES = 'x-relaydesk-max-retries';

export interface PublishOptions {
  correlationId?: string;
  messageId?: string;
  persistent?: boolean;
  headers?: Record<string, unknown>;
}

export async function publishJson(
  ch: ConfirmChannel,
  routingKey: string,
  body: unknown,
  options: PublishOptions = {},
): Promise<void> {
  const buf = Buffer.from(JSON.stringify(body));
  ch.publish(EXCHANGE_MAIN, routingKey, buf, {
    persistent: options.persistent ?? true,
    correlationId: options.correlationId,
    messageId: options.messageId,
    contentType: 'application/json',
    headers: options.headers,
  });
  await ch.waitForConfirms();
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
