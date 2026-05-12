"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simRedisDown = simRedisDown;
exports.simRabbitDown = simRabbitDown;
exports.simWebhookForcedTimeoutMs = simWebhookForcedTimeoutMs;
/**
 * Operacional / chaos-lite — activar via env em staging para validar retries e healthchecks.
 * Nunca activar em produção sem controlo explícito.
 */
function simRedisDown() {
    return process.env.RELAYDESK_SIM_REDIS_DOWN === '1' || process.env.RELAYDESK_SIM_REDIS_DOWN === 'true';
}
function simRabbitDown() {
    return process.env.RELAYDESK_SIM_RABBIT_DOWN === '1' || process.env.RELAYDESK_SIM_RABBIT_DOWN === 'true';
}
/** Força timeout curto no webhook HTTP outbound (ms). 0 = desactivado. */
function simWebhookForcedTimeoutMs() {
    const v = Number(process.env.RELAYDESK_SIM_WEBHOOK_TIMEOUT_MS ?? '0');
    return Number.isFinite(v) && v > 0 ? Math.min(v, 120_000) : 0;
}
//# sourceMappingURL=failure-simulation.js.map