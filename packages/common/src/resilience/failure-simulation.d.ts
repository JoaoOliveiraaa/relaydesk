/**
 * Operacional / chaos-lite — activar via env em staging para validar retries e healthchecks.
 * Nunca activar em produção sem controlo explícito.
 */
export declare function simRedisDown(): boolean;
export declare function simRabbitDown(): boolean;
/** Força timeout curto no webhook HTTP outbound (ms). 0 = desactivado. */
export declare function simWebhookForcedTimeoutMs(): number;
//# sourceMappingURL=failure-simulation.d.ts.map