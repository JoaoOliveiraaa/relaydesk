import type { ConsumeMessage } from 'amqplib';
import { context, propagation, trace, SpanStatusCode, type Context, type Span } from '@opentelemetry/api';

export const RELAYDESK_AMQP_HEADERS = {
  tenantId: 'x-relaydesk-tenant-id',
  conversationId: 'x-relaydesk-conversation-id',
  eventId: 'x-relaydesk-event-id',
  webhookDeliveryId: 'x-relaydesk-webhook-delivery-id',
} as const;

export type RelaydeskAmqpPublishAttrs = {
  tenantId?: string;
  conversationId?: string;
  eventId?: string;
  webhookDeliveryId?: string;
};

const amqpGetter = {
  get(carrier: Record<string, unknown>, key: string): string | string[] | undefined {
    const v = carrier[key];
    if (v === undefined || v === null) return undefined;
    if (Array.isArray(v)) return v.map(String);
    return String(v);
  },
  keys(carrier: Record<string, unknown>): string[] {
    return Object.keys(carrier);
  },
};

/** Extract distributed trace context from AMQP message headers (W3C traceparent). */
export function extractContextFromAmqpMessage(msg: ConsumeMessage): Context {
  const headers = (msg.properties.headers ?? {}) as Record<string, unknown>;
  return propagation.extract(context.active(), headers, amqpGetter);
}

/** Merge W3C trace context + RelayDesk semantic headers for outbound publish. */
export function mergePublishTraceHeaders(
  headers: Record<string, unknown> | undefined,
  relaydesk?: RelaydeskAmqpPublishAttrs,
): Record<string, unknown> {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  const out: Record<string, unknown> = { ...headers };
  for (const [k, v] of Object.entries(carrier)) {
    out[k] = v;
  }
  if (relaydesk?.tenantId) out[RELAYDESK_AMQP_HEADERS.tenantId] = relaydesk.tenantId;
  if (relaydesk?.conversationId) out[RELAYDESK_AMQP_HEADERS.conversationId] = relaydesk.conversationId;
  if (relaydesk?.eventId) out[RELAYDESK_AMQP_HEADERS.eventId] = relaydesk.eventId;
  if (relaydesk?.webhookDeliveryId) out[RELAYDESK_AMQP_HEADERS.webhookDeliveryId] = relaydesk.webhookDeliveryId;
  return out;
}

export function applyRelaydeskHeadersToSpan(span: Span, headers?: Record<string, unknown>): void {
  if (!headers) return;
  const t = headers[RELAYDESK_AMQP_HEADERS.tenantId];
  const c = headers[RELAYDESK_AMQP_HEADERS.conversationId];
  const e = headers[RELAYDESK_AMQP_HEADERS.eventId];
  const w = headers[RELAYDESK_AMQP_HEADERS.webhookDeliveryId];
  if (typeof t === 'string') span.setAttribute('relaydesk.tenant_id', t);
  if (typeof c === 'string') span.setAttribute('relaydesk.conversation_id', c);
  if (typeof e === 'string') span.setAttribute('relaydesk.event_id', e);
  if (typeof w === 'string') span.setAttribute('relaydesk.webhook_delivery_id', w);
}

/** Best-effort attributes from JSON payloads (fan-out / workers). */
export function applyPayloadCorrelationToSpan(span: Span, payload: unknown): void {
  if (!payload || typeof payload !== 'object') return;
  const o = payload as Record<string, unknown>;
  if (typeof o.tenantId === 'string') span.setAttribute('relaydesk.tenant_id', o.tenantId);
  if (typeof o.conversationId === 'string') span.setAttribute('relaydesk.conversation_id', o.conversationId);
  if (typeof o.messageId === 'string') span.setAttribute('relaydesk.message_id', o.messageId);
  if (typeof o.deliveryId === 'string') span.setAttribute('relaydesk.webhook_delivery_id', o.deliveryId);
  const id = o.id;
  if (typeof id === 'string' && id.startsWith('evt_')) span.setAttribute('relaydesk.event_id', id);
}

export { SpanStatusCode, context, trace };
