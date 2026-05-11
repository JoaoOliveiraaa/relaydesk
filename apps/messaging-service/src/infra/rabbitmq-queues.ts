import type { RelayDeskEnv } from '@relaydesk/config';
import { simRabbitDown } from '@relaydesk/common';

export type RabbitQueueSnapshot = Record<
  string,
  { messages?: number; messages_ready?: number; messages_unacknowledged?: number }
>;

/**
 * Consulta a Management API do RabbitMQ (opcional) para readiness de profundidade de filas.
 * `RABBITMQ_MANAGEMENT_URL` ex.: `http://relaydesk:relaydesk@127.0.0.1:15672`
 */
export async function snapshotRabbitMqQueues(
  env: RelayDeskEnv,
): Promise<{ ok: boolean; skipped?: boolean; queues?: RabbitQueueSnapshot; error?: string }> {
  if (simRabbitDown()) {
    return { ok: false, error: 'simulated_rabbit_down' };
  }
  const base = env.RABBITMQ_MANAGEMENT_URL;
  if (!base) {
    return { ok: true, skipped: true };
  }
  const url = new URL(base);
  const user = decodeURIComponent(url.username || 'guest');
  const pass = decodeURIComponent(url.password || 'guest');
  const origin = `${url.protocol}//${url.host}`;
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  try {
    const res = await fetch(`${origin}/api/queues/%2F`, {
      headers: { Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { ok: false, error: `management_http_${res.status}` };
    }
    const list = (await res.json()) as Array<{
      name: string;
      messages?: number;
      messages_ready?: number;
      messages_unacknowledged?: number;
    }>;
    const queues: RabbitQueueSnapshot = {};
    for (const q of list) {
      queues[q.name] = {
        messages: q.messages,
        messages_ready: q.messages_ready,
        messages_unacknowledged: q.messages_unacknowledged,
      };
    }
    return { ok: true, queues };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'rabbit_management_fetch_failed' };
  }
}
