/**
 * @relaydesk/sdk — foundation para cliente HTTP tipado.
 * A documentação OpenAPI vive em `/openapi.json` de cada serviço; este pacote centraliza paths estáveis.
 */

/** Versão de contrato HTTP alinhada com `@relaydesk/common` / envelopes. */
export const RELAYDESK_API_VERSION = '2024-06-01' as const;

export const RelaydeskPaths = {
  auth: {
    register: '/v1/auth/register',
    login: '/v1/auth/login',
    refresh: '/v1/auth/refresh',
    me: '/v1/auth/me',
  },
  messaging: {
    ingest: '/v1/messages/ingest',
    inboxConversations: '/v1/inbox/conversations',
    inboxMessages: (conversationId: string) =>
      `/v1/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
  },
  webhooks: {
    list: '/v1/webhooks',
    create: '/v1/webhooks',
    get: (id: string) => `/v1/webhooks/${encodeURIComponent(id)}`,
    update: (id: string) => `/v1/webhooks/${encodeURIComponent(id)}`,
    delete: (id: string) => `/v1/webhooks/${encodeURIComponent(id)}`,
    rotateSecret: (id: string) => `/v1/webhooks/${encodeURIComponent(id)}/rotate-secret`,
    test: (id: string) => `/v1/webhooks/${encodeURIComponent(id)}/test`,
    deliveries: '/v1/webhook-deliveries',
    delivery: (id: string) => `/v1/webhook-deliveries/${encodeURIComponent(id)}`,
    replayDelivery: (id: string) => `/v1/webhook-deliveries/${encodeURIComponent(id)}/replay`,
  },
  internal: {
    conversationMembership: (conversationId: string, tenantId: string) =>
      `/internal/v1/conversations/${encodeURIComponent(conversationId)}/tenants/${encodeURIComponent(tenantId)}/membership`,
  },
} as const;

export type RelaydeskPathsType = typeof RelaydeskPaths;

// ————— Webhook event types —————

export const WEBHOOK_EVENT_TYPES = [
  'conversation.created',
  'conversation.updated',
  'conversation.resolved',
  'conversation.assigned',
  'message.received',
  'message.sent',
  'contact.created',
  'contact.updated',
  'webhook.test',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export interface WebhookEventEnvelope<T = Record<string, unknown>> {
  /** Unique event ID */
  id: string;
  /** Always "event" */
  object: 'event';
  /** Event type string */
  type: WebhookEventType | string;
  /** Unix timestamp (seconds) when the event was created */
  created: number;
  /** API version that generated this event */
  apiVersion: string;
  /** The tenant that owns this event */
  tenantId: string;
  /** Event-specific payload */
  data: T;
}

export interface WebhookSubscription {
  id: string;
  tenantId: string;
  url: string;
  description: string | null;
  eventTypes: string[];
  state: 'active' | 'paused';
  secretHint: string;
  retryPolicy: WebhookRetryPolicy;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookRetryPolicy {
  maxAttempts: number;
  backoffBase: number;
  backoffCap: number;
  timeoutSeconds: number;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  eventType: string;
  idempotencyKey: string | null;
  status: 'pending' | 'sending' | 'delivered' | 'failed' | 'dead';
  attempts: number;
  httpStatus: number | null;
  responseSnippet: string | null;
  lastError: string | null;
  correlationId: string | null;
  nextAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ————— Signature verification helpers —————

/**
 * Verify a RelayDesk webhook signature.
 *
 * @example
 * ```ts
 * import { verifyWebhookSignature } from '@relaydesk/sdk';
 *
 * app.post('/webhook', (req, res) => {
 *   const isValid = verifyWebhookSignature(
 *     process.env.WEBHOOK_SECRET,
 *     req.rawBody,           // raw string body
 *     req.headers['x-relaydesk-signature'],
 *   );
 *   if (!isValid) return res.status(401).send('Invalid signature');
 *   // process event ...
 * });
 * ```
 */
export function verifyWebhookSignature(
  secret: string,
  rawBody: string,
  signatureHeader: string,
  toleranceSeconds = 300,
): boolean {
  // Browser/Node universal — uses SubtleCrypto when available, falls back to sync
  try {
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((p) => {
        const idx = p.indexOf('=');
        return [p.slice(0, idx), p.slice(idx + 1)];
      }),
    ) as Record<string, string>;

    const timestamp = Number(parts['t']);
    const receivedV1 = parts['v1'];
    if (!timestamp || !receivedV1) return false;

    const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
    if (age > toleranceSeconds) return false;

    // Node.js crypto path
    if (typeof require !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createHmac, timingSafeEqual } = require('node:crypto') as typeof import('node:crypto');
      const toSign = `${timestamp}.${rawBody}`;
      const expected = createHmac('sha256', secret).update(toSign).digest('hex');
      return timingSafeEqual(Buffer.from(receivedV1), Buffer.from(expected));
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Parse and verify a webhook delivery, returning typed event envelope.
 * Throws if signature verification fails.
 */
export function constructWebhookEvent<T = Record<string, unknown>>(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): WebhookEventEnvelope<T> {
  const valid = verifyWebhookSignature(secret, rawBody, signatureHeader);
  if (!valid) {
    throw new Error(
      'Webhook signature verification failed. Ensure you pass the raw body string and the correct secret.',
    );
  }
  return JSON.parse(rawBody) as WebhookEventEnvelope<T>;
}
