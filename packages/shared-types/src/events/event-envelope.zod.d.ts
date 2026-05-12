import { z } from 'zod';
/** Namespaces lógicos para evolução e routing de contratos (ex.: relaydesk.messaging.v1). */
export declare const relayEventNamespaceSchema: z.ZodString;
export declare const relayEventTracingMetaSchema: z.ZodObject<{
    correlationId: z.ZodOptional<z.ZodString>;
    traceparent: z.ZodOptional<z.ZodString>;
    tracestate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    correlationId?: string | undefined;
    traceparent?: string | undefined;
    tracestate?: string | undefined;
}, {
    correlationId?: string | undefined;
    traceparent?: string | undefined;
    tracestate?: string | undefined;
}>;
export declare const relayEventRetryMetaSchema: z.ZodObject<{
    attempt: z.ZodNumber;
    maxAttempts: z.ZodOptional<z.ZodNumber>;
    lastError: z.ZodOptional<z.ZodString>;
    lastAttemptAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    attempt: number;
    maxAttempts?: number | undefined;
    lastError?: string | undefined;
    lastAttemptAt?: string | undefined;
}, {
    attempt: number;
    maxAttempts?: number | undefined;
    lastError?: string | undefined;
    lastAttemptAt?: string | undefined;
}>;
/** Schema base do envelope — validar antes de publicar/consumir na fila. */
export declare const relayEventEnvelopeBaseSchema: z.ZodObject<{
    eventId: z.ZodString;
    envelopeVersion: z.ZodLiteral<1>;
    schemaVersion: z.ZodString;
    eventType: z.ZodString;
    namespace: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    emittedAt: z.ZodString;
    producer: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    tracing: z.ZodOptional<z.ZodObject<{
        correlationId: z.ZodOptional<z.ZodString>;
        traceparent: z.ZodOptional<z.ZodString>;
        tracestate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        correlationId?: string | undefined;
        traceparent?: string | undefined;
        tracestate?: string | undefined;
    }, {
        correlationId?: string | undefined;
        traceparent?: string | undefined;
        tracestate?: string | undefined;
    }>>;
    retry: z.ZodOptional<z.ZodObject<{
        attempt: z.ZodNumber;
        maxAttempts: z.ZodOptional<z.ZodNumber>;
        lastError: z.ZodOptional<z.ZodString>;
        lastAttemptAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        attempt: number;
        maxAttempts?: number | undefined;
        lastError?: string | undefined;
        lastAttemptAt?: string | undefined;
    }, {
        attempt: number;
        maxAttempts?: number | undefined;
        lastError?: string | undefined;
        lastAttemptAt?: string | undefined;
    }>>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    envelopeVersion: 1;
    schemaVersion: string;
    eventType: string;
    emittedAt: string;
    producer: string;
    payload: Record<string, unknown>;
    namespace?: string | undefined;
    tenantId?: string | undefined;
    causationId?: string | undefined;
    tracing?: {
        correlationId?: string | undefined;
        traceparent?: string | undefined;
        tracestate?: string | undefined;
    } | undefined;
    retry?: {
        attempt: number;
        maxAttempts?: number | undefined;
        lastError?: string | undefined;
        lastAttemptAt?: string | undefined;
    } | undefined;
}, {
    eventId: string;
    envelopeVersion: 1;
    schemaVersion: string;
    eventType: string;
    emittedAt: string;
    producer: string;
    payload: Record<string, unknown>;
    namespace?: string | undefined;
    tenantId?: string | undefined;
    causationId?: string | undefined;
    tracing?: {
        correlationId?: string | undefined;
        traceparent?: string | undefined;
        tracestate?: string | undefined;
    } | undefined;
    retry?: {
        attempt: number;
        maxAttempts?: number | undefined;
        lastError?: string | undefined;
        lastAttemptAt?: string | undefined;
    } | undefined;
}>;
export type RelayEventEnvelopeParsed = z.infer<typeof relayEventEnvelopeBaseSchema>;
export declare function parseRelayEventEnvelope(input: unknown): {
    ok: true;
    value: RelayEventEnvelopeParsed;
} | {
    ok: false;
    error: z.ZodError;
};
//# sourceMappingURL=event-envelope.zod.d.ts.map