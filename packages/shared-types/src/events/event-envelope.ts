/**
 * Envelope enterprise para mensagens AMQP / domínio (governação de eventos).
 * Produtores devem preencher ids e tracing; consumidores validam `schemaVersion` + payload.
 */
export interface RelayEventRetryMeta {
  attempt: number;
  maxAttempts?: number;
  lastError?: string;
  /** ISO-8601 */
  lastAttemptAt?: string;
}

export interface RelayEventTracingMeta {
  correlationId?: string;
  traceparent?: string;
  tracestate?: string;
}

export interface RelayEventEnvelope<TPayload = Record<string, unknown>> {
  /** Identificador único do evento (idempotência, dedupe). */
  eventId: string;
  /** Versão do contrato do envelope (não confundir com versão de negócio em `payload`). */
  envelopeVersion: 1;
  /** Versão semântica do schema do payload (ex.: "2025-11.messageProcessed.v1"). */
  schemaVersion: string;
  /** Tipo lógico estável (ex.: message.processed). */
  eventType: string;
  /** Namespace do domínio (governação / compatibilidade). Ex.: relaydesk.messaging */
  namespace?: string;
  /** Tenant dono do evento (fronteira de segurança). */
  tenantId?: string;
  /** Momento de emissão ISO-8601. */
  emittedAt: string;
  /** Serviço origem (identidade de produtor). */
  producer: string;
  /** Cadeia de causa (opcional). */
  causationId?: string;
  tracing?: RelayEventTracingMeta;
  retry?: RelayEventRetryMeta;
  payload: TPayload;
}
