import { z } from 'zod';

/** Namespaces lógicos para evolução e routing de contratos (ex.: relaydesk.messaging.v1). */
export const relayEventNamespaceSchema = z
  .string()
  .min(3)
  .max(128)
  .regex(/^[a-z0-9][a-z0-9._-]*$/i, 'namespace inválido');

export const relayEventTracingMetaSchema = z.object({
  correlationId: z.string().min(1).max(256).optional(),
  traceparent: z.string().min(1).max(256).optional(),
  tracestate: z.string().min(1).max(512).optional(),
});

export const relayEventRetryMetaSchema = z.object({
  attempt: z.number().int().nonnegative(),
  maxAttempts: z.number().int().positive().optional(),
  lastError: z.string().max(8000).optional(),
  lastAttemptAt: z.string().max(64).optional(),
});

/** Schema base do envelope — validar antes de publicar/consumir na fila. */
export const relayEventEnvelopeBaseSchema = z.object({
  eventId: z.string().min(8).max(128),
  envelopeVersion: z.literal(1),
  schemaVersion: z.string().min(1).max(128),
  eventType: z.string().min(1).max(256),
  namespace: relayEventNamespaceSchema.optional(),
  tenantId: z.string().min(1).max(64).optional(),
  emittedAt: z.string().min(4).max(64),
  producer: z.string().min(1).max(128),
  causationId: z.string().min(8).max(128).optional(),
  tracing: relayEventTracingMetaSchema.optional(),
  retry: relayEventRetryMetaSchema.optional(),
  payload: z.record(z.string(), z.unknown()),
});

export type RelayEventEnvelopeParsed = z.infer<typeof relayEventEnvelopeBaseSchema>;

export function parseRelayEventEnvelope(
  input: unknown,
): { ok: true; value: RelayEventEnvelopeParsed } | { ok: false; error: z.ZodError } {
  const r = relayEventEnvelopeBaseSchema.safeParse(input);
  if (r.success) return { ok: true, value: r.data };
  return { ok: false, error: r.error };
}
