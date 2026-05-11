/**
 * Operacional / chaos-lite — activar via env em staging para validar retries e healthchecks.
 * Nunca activar em produção sem controlo explícito.
 */
export function simRedisDown(): boolean {
  return process.env.RELAYDESK_SIM_REDIS_DOWN === '1' || process.env.RELAYDESK_SIM_REDIS_DOWN === 'true';
}

export function simRabbitDown(): boolean {
  return process.env.RELAYDESK_SIM_RABBIT_DOWN === '1' || process.env.RELAYDESK_SIM_RABBIT_DOWN === 'true';
}

/** Força timeout curto no webhook HTTP outbound (ms). 0 = desactivado. */
export function simWebhookForcedTimeoutMs(): number {
  const v = Number(process.env.RELAYDESK_SIM_WEBHOOK_TIMEOUT_MS ?? '0');
  return Number.isFinite(v) && v > 0 ? Math.min(v, 120_000) : 0;
}
