import type { IncomingMessage, RelayChannel } from '@relaydesk/shared-types';

/** Contexto mínimo para normalizar inbound com tenant e ligação persistida. */
export interface ChannelInboundContext {
  tenantId: string;
  channelConnectionId: string;
}

/**
 * Contrato para adapters de canais (WhatsApp Cloud API, Telegram Bot API, etc.).
 * Cada adapter traduz payloads nativos para {@link IncomingMessage}.
 */
export interface ChannelInboundAdapter {
  readonly channel: RelayChannel;
  normalizeInbound(
    raw: unknown,
    ctx: ChannelInboundContext,
  ): IncomingMessage | null | Promise<IncomingMessage | null>;
}
