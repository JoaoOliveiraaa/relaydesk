"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relayEventEnvelopeBaseSchema = exports.relayEventRetryMetaSchema = exports.relayEventTracingMetaSchema = exports.relayEventNamespaceSchema = void 0;
exports.parseRelayEventEnvelope = parseRelayEventEnvelope;
const zod_1 = require("zod");
/** Namespaces lógicos para evolução e routing de contratos (ex.: relaydesk.messaging.v1). */
exports.relayEventNamespaceSchema = zod_1.z
    .string()
    .min(3)
    .max(128)
    .regex(/^[a-z0-9][a-z0-9._-]*$/i, 'namespace inválido');
exports.relayEventTracingMetaSchema = zod_1.z.object({
    correlationId: zod_1.z.string().min(1).max(256).optional(),
    traceparent: zod_1.z.string().min(1).max(256).optional(),
    tracestate: zod_1.z.string().min(1).max(512).optional(),
});
exports.relayEventRetryMetaSchema = zod_1.z.object({
    attempt: zod_1.z.number().int().nonnegative(),
    maxAttempts: zod_1.z.number().int().positive().optional(),
    lastError: zod_1.z.string().max(8000).optional(),
    lastAttemptAt: zod_1.z.string().max(64).optional(),
});
/** Schema base do envelope — validar antes de publicar/consumir na fila. */
exports.relayEventEnvelopeBaseSchema = zod_1.z.object({
    eventId: zod_1.z.string().min(8).max(128),
    envelopeVersion: zod_1.z.literal(1),
    schemaVersion: zod_1.z.string().min(1).max(128),
    eventType: zod_1.z.string().min(1).max(256),
    namespace: exports.relayEventNamespaceSchema.optional(),
    tenantId: zod_1.z.string().min(1).max(64).optional(),
    emittedAt: zod_1.z.string().min(4).max(64),
    producer: zod_1.z.string().min(1).max(128),
    causationId: zod_1.z.string().min(8).max(128).optional(),
    tracing: exports.relayEventTracingMetaSchema.optional(),
    retry: exports.relayEventRetryMetaSchema.optional(),
    payload: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
});
function parseRelayEventEnvelope(input) {
    const r = exports.relayEventEnvelopeBaseSchema.safeParse(input);
    if (r.success)
        return { ok: true, value: r.data };
    return { ok: false, error: r.error };
}
//# sourceMappingURL=event-envelope.zod.js.map